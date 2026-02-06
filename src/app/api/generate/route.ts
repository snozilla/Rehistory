import { streamObject } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { generatedTimelineSchema } from "@/lib/ai/schema";
import { getSystemPrompt, getUserPrompt } from "@/lib/ai/prompts";

export const maxDuration = 120;

export async function POST(req: Request) {
  try {
    const { premise, provider, apiKey, model } = await req.json();

    if (!premise || !apiKey) {
      return new Response("Missing premise or API key", { status: 400 });
    }

    let aiModel;
    if (provider === "anthropic") {
      const anthropic = createAnthropic({ apiKey });
      aiModel = anthropic(model || "claude-sonnet-4-5-20250929");
    } else {
      const openai = createOpenAI({ apiKey });
      aiModel = openai(model || "gpt-4o");
    }

    const result = streamObject({
      model: aiModel,
      schema: generatedTimelineSchema,
      system: getSystemPrompt(),
      prompt: getUserPrompt(premise),
    });

    return result.toTextStreamResponse();
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    return new Response(message, { status: 500 });
  }
}
