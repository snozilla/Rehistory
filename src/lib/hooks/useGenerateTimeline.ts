"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTimelineStore } from "@/lib/store/timeline-store";
import { useSettingsStore } from "@/lib/store/settings-store";
import { generateStream } from "@/lib/ai/client-generate";
import type { TimelineEvent, EventConnection } from "@/types/timeline";

interface PartialTimeline {
  divergenceYear?: number;
  divergenceDescription?: string;
  events?: Partial<TimelineEvent>[];
  connections?: Partial<EventConnection>[];
  realHistoryEvents?: Partial<TimelineEvent>[];
  error?: string;
}

function isValidEvent(e: unknown): e is TimelineEvent {
  if (!e || typeof e !== "object") return false;
  const obj = e as Record<string, unknown>;
  return (
    typeof obj.id === "string" &&
    typeof obj.title === "string" &&
    typeof obj.year === "number" &&
    typeof obj.category === "string"
  );
}

function isValidConnection(c: unknown): c is EventConnection {
  if (!c || typeof c !== "object") return false;
  const obj = c as Record<string, unknown>;
  return typeof obj.sourceId === "string" && typeof obj.targetId === "string";
}

/** Try to repair truncated JSON by closing open braces/brackets */
function repairJson(text: string): string {
  try {
    JSON.parse(text);
    return text;
  } catch {
    // Remove trailing incomplete key-value pairs or strings
    let fixed = text.replace(/,\s*"[^"]*$/, "");
    fixed = fixed.replace(/,\s*$/, "");
    // Remove trailing incomplete object inside an array
    fixed = fixed.replace(/,\s*\{[^}]*$/, "");

    let braces = 0;
    let brackets = 0;
    let inString = false;
    let escaped = false;
    for (const ch of fixed) {
      if (escaped) { escaped = false; continue; }
      if (ch === "\\") { escaped = true; continue; }
      if (ch === '"') { inString = !inString; continue; }
      if (inString) continue;
      if (ch === "{") braces++;
      if (ch === "}") braces--;
      if (ch === "[") brackets++;
      if (ch === "]") brackets--;
    }

    while (brackets > 0) { fixed += "]"; brackets--; }
    while (braces > 0) { fixed += "}"; braces--; }

    return fixed;
  }
}

function cleanStreamText(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
  }
  return cleaned;
}

function tryParseTimeline(text: string): PartialTimeline | null {
  try {
    const cleaned = cleanStreamText(text);
    if (!cleaned.startsWith("{")) return null;
    return JSON.parse(repairJson(cleaned)) as PartialTimeline;
  } catch {
    return null;
  }
}

function applyTimeline(
  data: PartialTimeline,
  updateCurrentTimeline: (t: {
    divergenceYear: number;
    divergenceDescription: string;
    events: TimelineEvent[];
    connections: EventConnection[];
    realHistoryEvents: TimelineEvent[];
  }) => void
) {
  updateCurrentTimeline({
    divergenceYear: Number(data.divergenceYear) || 0,
    divergenceDescription: String(data.divergenceDescription ?? ""),
    events: (data.events ?? []).filter(isValidEvent),
    connections: (data.connections ?? []).filter(isValidConnection),
    realHistoryEvents: (data.realHistoryEvents ?? []).filter(isValidEvent),
  });
}

export function useGenerateTimeline() {
  const router = useRouter();
  const startGeneration = useTimelineStore((s) => s.startGeneration);
  const updateCurrentTimeline = useTimelineStore((s) => s.updateCurrentTimeline);
  const finishGeneration = useTimelineStore((s) => s.finishGeneration);
  const setError = useTimelineStore((s) => s.setError);

  const provider = useSettingsStore((s) => s.provider);
  const getActiveKey = useSettingsStore((s) => s.getActiveKey);
  const getActiveModel = useSettingsStore((s) => s.getActiveModel);
  const eventCount = useSettingsStore((s) => s.eventCount);

  const [isLoading, setIsLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const generate = useCallback(
    async (premise: string) => {
      const apiKey = getActiveKey();
      if (!apiKey) {
        setError("Please configure your API key in Settings");
        return;
      }

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setIsLoading(true);
      startGeneration(premise);
      router.push("/explore");

      try {
        let lastEventCount = 0;

        const finalText = await generateStream({
          premise,
          provider,
          apiKey,
          model: getActiveModel(),
          eventCount,
          signal: controller.signal,
          onChunk(accumulated) {
            const partial = tryParseTimeline(accumulated);
            if (partial) {
              const validEvents = (partial.events ?? []).filter(isValidEvent);
              if (
                validEvents.length > lastEventCount ||
                (lastEventCount === 0 && partial.divergenceYear)
              ) {
                lastEventCount = validEvents.length;
                applyTimeline(partial, updateCurrentTimeline);
              }
            }
          },
        });

        const final = tryParseTimeline(finalText);
        if (final) {
          applyTimeline(final, updateCurrentTimeline);
        } else {
          throw new Error("Failed to parse AI response");
        }

        finishGeneration();
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Generation failed");
      } finally {
        setIsLoading(false);
      }
    },
    [
      provider,
      eventCount,
      getActiveKey,
      getActiveModel,
      startGeneration,
      updateCurrentTimeline,
      finishGeneration,
      setError,
      router,
    ]
  );

  return { generate, isLoading };
}
