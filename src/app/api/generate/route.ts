import { generateObject } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { generatedTimelineSchema } from "@/lib/ai/schema";
import { getSystemPrompt, getUserPrompt } from "@/lib/ai/prompts";

export const runtime = "edge";

export async function POST(req: Request) {
  const { premise, provider, apiKey: rawKey, model } = await req.json();
  const apiKey = typeof rawKey === "string" ? rawKey.trim() : "";

  if (!premise || !apiKey) {
    return Response.json(
      { error: "Missing premise or API key" },
      { status: 400 }
    );
  }

  try {
    if (provider === "anthropic") {
      return await handleAnthropicStreaming(premise, apiKey, model);
    } else {
      return await handleOpenAI(premise, apiKey, model);
    }
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    return Response.json(
      { error: `[${provider}/${model}] ${message}` },
      { status: 500 }
    );
  }
}

const JSON_SYSTEM = `${getSystemPrompt()}

IMPORTANT: Respond ONLY with valid JSON matching this exact structure (no markdown, no explanation):
{
  "divergenceYear": <number>,
  "divergenceDescription": "<string>",
  "events": [
    {
      "id": "evt_1",
      "year": <number>,
      "title": "<string>",
      "description": "<1-2 sentences>",
      "category": "<Politics|Technology|Culture|Economy|Military|Science|Society>",
      "significance": <1-5>,
      "causedBy": ["<event ids>"],
      "realWorldCounterpart": "<string or null>"
    }
  ],
  "connections": [
    { "sourceId": "<id>", "targetId": "<id>", "relationship": "<string>" }
  ],
  "realHistoryEvents": [
    <same structure as events, with ids like "real_1">
  ]
}

Keep descriptions to 1-2 sentences. Generate exactly 20 alt events, 12 real events, and 15 connections.`;

async function handleAnthropicStreaming(
  premise: string,
  apiKey: string,
  model?: string
) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: model || "claude-sonnet-4-5-20250929",
      max_tokens: 8192,
      stream: true,
      system: JSON_SYSTEM,
      messages: [{ role: "user", content: getUserPrompt(premise) }],
    }),
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`Anthropic API ${response.status}: ${errBody}`);
  }

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const stream = new ReadableStream({
    async start(controller) {
      const reader = response.body!.getReader();
      let buffer = "";

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const payload = line.slice(6).trim();
            if (payload === "[DONE]") continue;

            try {
              const event = JSON.parse(payload);

              if (event.type === "error") {
                controller.enqueue(
                  encoder.encode(`__ERROR__${JSON.stringify(event.error)}`)
                );
                controller.close();
                return;
              }

              // Text deltas from the response
              if (
                event.type === "content_block_delta" &&
                event.delta?.type === "text_delta"
              ) {
                controller.enqueue(encoder.encode(event.delta.text));
              }
            } catch {
              // Skip unparseable lines
            }
          }
        }
      } catch (err) {
        controller.enqueue(
          encoder.encode(
            `__ERROR__${err instanceof Error ? err.message : "Stream failed"}`
          )
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}

async function handleOpenAI(premise: string, apiKey: string, model?: string) {
  const openai = createOpenAI({ apiKey });
  const aiModel = openai(model || "gpt-4o");

  const { object } = await generateObject({
    model: aiModel,
    schema: generatedTimelineSchema,
    system: getSystemPrompt(),
    prompt: getUserPrompt(premise),
  });

  return Response.json(object);
}
