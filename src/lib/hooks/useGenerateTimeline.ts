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
          const text = await response.text();
          throw new Error(text || `HTTP ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response body");

        const decoder = new TextDecoder();
        let fullText = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          fullText += decoder.decode(value, { stream: true });

          try {
            const parsed = tryParsePartialJson(fullText) as PartialTimeline | null;
            if (parsed) {
              updateCurrentTimeline({
                divergenceYear: Number(parsed.divergenceYear) || 0,
                divergenceDescription: String(parsed.divergenceDescription ?? ""),
                events: (parsed.events ?? []).filter(isValidEvent),
                connections: (parsed.connections ?? []).filter(isValidConnection),
                realHistoryEvents: (parsed.realHistoryEvents ?? []).filter(isValidEvent),
              });
            }
          } catch {
            // Partial JSON not yet parseable
          }
        }

        // Check if we got an error or empty response
        const trimmed = fullText.trim();
        if (!trimmed) {
          throw new Error("Empty response — the AI provider may have rejected the request. Check your API key and try again.");
        }
        // Detect error JSON or plain text errors
        if (trimmed.startsWith("{\"error") || trimmed.startsWith("Error") || trimmed.startsWith("<!")) {
          throw new Error(trimmed.slice(0, 200));
        }

        // Final parse
        try {
          const final = JSON.parse(trimmed) as PartialTimeline;
          updateCurrentTimeline({
            divergenceYear: Number(final.divergenceYear) || 0,
            divergenceDescription: String(final.divergenceDescription ?? ""),
            events: (final.events ?? []).filter(isValidEvent),
            connections: (final.connections ?? []).filter(isValidConnection),
            realHistoryEvents: (final.realHistoryEvents ?? []).filter(isValidEvent),
          });
        } catch {
          // Use whatever we have
        }

        finishGeneration();
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Generation failed");
      } finally {
        setIsLoading(false);
      }
    },
    [provider, getActiveKey, getActiveModel, startGeneration, updateCurrentTimeline, finishGeneration, setError, router]
  );

  return { generate, isLoading };
}

function tryParsePartialJson(text: string): Record<string, unknown> | null {
  const trimmed = text.trim();
  if (!trimmed) return null;

  try {
    return JSON.parse(trimmed);
  } catch {
    // Continue with fixup
  }

  let fixed = trimmed;
  const opens: string[] = [];
  let inString = false;
  let escaped = false;

  for (const char of fixed) {
    if (escaped) { escaped = false; continue; }
    if (char === "\\") { escaped = true; continue; }
    if (char === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (char === "{") opens.push("}");
    else if (char === "[") opens.push("]");
    else if (char === "}" || char === "]") opens.pop();
  }

  if (inString) fixed += '"';
  fixed = fixed.replace(/,\s*$/, "");
  while (opens.length > 0) fixed += opens.pop();

  try {
    return JSON.parse(fixed);
  } catch {
    return null;
  }
}
