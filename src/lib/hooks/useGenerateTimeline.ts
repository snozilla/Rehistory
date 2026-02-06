"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTimelineStore } from "@/lib/store/timeline-store";
import { useSettingsStore } from "@/lib/store/settings-store";
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
        const response = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            premise,
            provider,
            apiKey,
            model: getActiveModel(),
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => null);
          throw new Error(errData?.error || `HTTP ${response.status}`);
        }

        const contentType = response.headers.get("content-type") || "";

        if (contentType.includes("text/plain") && response.body) {
          // Stream in progressively
          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let accumulated = "";
          let lastEventCount = 0;

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            accumulated += decoder.decode(value, { stream: true });

            // Check for error markers
            if (accumulated.includes("__ERROR__")) {
              throw new Error(
                accumulated.split("__ERROR__").pop() || "Stream error"
              );
            }

            // Try to parse partial JSON and update UI
            const partial = tryParseTimeline(accumulated);
            if (partial) {
              const validEvents = (partial.events ?? []).filter(isValidEvent);
              // Only update if we have new events to show
              if (
                validEvents.length > lastEventCount ||
                (lastEventCount === 0 && partial.divergenceYear)
              ) {
                lastEventCount = validEvents.length;
                applyTimeline(partial, updateCurrentTimeline);
              }
            }
          }

          // Final parse with complete text
          const final = tryParseTimeline(accumulated);
          if (final) {
            applyTimeline(final, updateCurrentTimeline);
          } else {
            throw new Error("Failed to parse AI response");
          }
        } else {
          // JSON response (OpenAI)
          const data = (await response.json()) as PartialTimeline;
          if (data.error) throw new Error(data.error);
          applyTimeline(data, updateCurrentTimeline);
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
