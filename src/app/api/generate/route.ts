import { generateObject } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { generatedTimelineSchema } from "@/lib/ai/schema";
import { getSystemPrompt, getUserPrompt } from "@/lib/ai/prompts";
import { zodToJsonSchema } from "zod-to-json-schema";

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
      return await handleAnthropic(premise, apiKey, model);
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

async function handleAnthropic(premise: string, apiKey: string, model?: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const jsonSchema = zodToJsonSchema(generatedTimelineSchema as any, {
    target: "openApi3",
  });

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: model || "claude-sonnet-4-5-20250929",
      max_tokens: 16000,
      system: getSystemPrompt(),
      messages: [{ role: "user", content: getUserPrompt(premise) }],
      tools: [
        {
          name: "generate_timeline",
          description: "Generate the alternative history timeline with all events, connections, and real history counterparts",
          input_schema: jsonSchema,
        },
      ],
      tool_choice: { type: "tool", name: "generate_timeline" },
    }),
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`Anthropic API ${response.status}: ${errBody}`);
  }

  const data = await response.json();
  const toolUse = data.content?.find(
    (block: { type: string }) => block.type === "tool_use"
  );

  if (!toolUse?.input) {
    throw new Error("No structured output returned from Anthropic");
  }

  return Response.json(toolUse.input);
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
