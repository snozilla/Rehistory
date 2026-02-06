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

        // Handle streamed plain text (Anthropic) vs JSON (OpenAI)
        const contentType = response.headers.get("content-type") || "";
        let data: PartialTimeline;

        if (contentType.includes("text/plain")) {
          const text = await response.text();
          if (text.includes("__ERROR__")) {
            throw new Error(text.split("__ERROR__").pop() || "Stream error");
          }
          data = JSON.parse(text) as PartialTimeline;
        } else {
          data = (await response.json()) as PartialTimeline;
        }

        if (data.error) {
          throw new Error(data.error);
        }

        updateCurrentTimeline({
          divergenceYear: Number(data.divergenceYear) || 0,
          divergenceDescription: String(data.divergenceDescription ?? ""),
          events: (data.events ?? []).filter(isValidEvent),
          connections: (data.connections ?? []).filter(isValidConnection),
          realHistoryEvents: (data.realHistoryEvents ?? []).filter(isValidEvent),
        });

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
