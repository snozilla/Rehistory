import { getSystemPrompt, getUserPrompt } from "./prompts";

function buildJsonSystem(eventCount: number, realCount: number, connectionCount: number) {
  return `${getSystemPrompt()}

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

Keep descriptions to 1-2 sentences. Generate exactly ${eventCount} alt events, ${realCount} real events, and ${connectionCount} connections.`;
}

export interface GenerateOptions {
  premise: string;
  provider: string;
  apiKey: string;
  model?: string;
  eventCount: number;
  signal?: AbortSignal;
  onChunk: (text: string) => void;
}

export async function generateStream(opts: GenerateOptions): Promise<string> {
  const { premise, provider, apiKey, model, eventCount, signal, onChunk } = opts;
  const realCount = Math.max(Math.round(eventCount * 0.6), 3);
  const connectionCount = Math.max(Math.round(eventCount * 0.75), 5);
  const systemPrompt = buildJsonSystem(eventCount, realCount, connectionCount);

  if (provider === "anthropic") {
    return streamAnthropic(premise, apiKey, model, systemPrompt, signal, onChunk);
  } else {
    return streamOpenAI(premise, apiKey, model, systemPrompt, signal, onChunk);
  }
}

async function streamAnthropic(
  premise: string,
  apiKey: string,
  model: string | undefined,
  systemPrompt: string,
  signal: AbortSignal | undefined,
  onChunk: (text: string) => void
): Promise<string> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: model || "claude-sonnet-4-5-20250929",
      max_tokens: 8192,
      stream: true,
      system: systemPrompt,
      messages: [{ role: "user", content: getUserPrompt(premise) }],
    }),
    signal,
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`Anthropic API ${response.status}: ${errBody}`);
  }

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let accumulated = "";

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
          throw new Error(JSON.stringify(event.error));
        }
        if (event.type === "content_block_delta" && event.delta?.type === "text_delta") {
          accumulated += event.delta.text;
          onChunk(accumulated);
        }
      } catch (e) {
        if (e instanceof Error && e.message.startsWith("{")) throw e;
      }
    }
  }

  return accumulated;
}

async function streamOpenAI(
  premise: string,
  apiKey: string,
  model: string | undefined,
  systemPrompt: string,
  signal: AbortSignal | undefined,
  onChunk: (text: string) => void
): Promise<string> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model || "gpt-4o",
      stream: true,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: getUserPrompt(premise) },
      ],
    }),
    signal,
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`OpenAI API ${response.status}: ${errBody}`);
  }

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let accumulated = "";

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
        const delta = event.choices?.[0]?.delta?.content;
        if (delta) {
          accumulated += delta;
          onChunk(accumulated);
        }
      } catch {
        // skip
      }
    }
  }

  return accumulated;
}
