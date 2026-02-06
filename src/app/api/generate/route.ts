import { generateObject } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { generatedTimelineSchema } from "@/lib/ai/schema";
import { getSystemPrompt, getUserPrompt } from "@/lib/ai/prompts";

export const runtime = "edge";

export async function POST(req: Request) {
  const { premise, provider, apiKey: rawKey, model } = await req.json();
  const apiKey = typeof rawKey === "string" ? rawKey.trim() : "";

  if (!premise || !apiKey) {
    return Response.json({ error: "Missing premise or API key" }, { status: 400 });
  }

  try {
    let aiModel;
    if (provider === "anthropic") {
      const anthropic = createAnthropic({ apiKey });
      aiModel = anthropic(model || "claude-sonnet-4-5-20250929");
    } else {
      const openai = createOpenAI({ apiKey });
      aiModel = openai(model || "gpt-4o");
    }

    const { object } = await generateObject({
      model: aiModel,
      schema: generatedTimelineSchema,
      system: getSystemPrompt(),
      prompt: getUserPrompt(premise),
    });

    return Response.json(object);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    return Response.json(
      { error: `[${provider}/${model}] ${message}` },
      { status: 500 }
    );
  }
}
