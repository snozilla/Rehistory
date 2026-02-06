"use client";

import { motion } from "motion/react";
import { Loader2 } from "lucide-react";
import { useTimelineStore } from "@/lib/store/timeline-store";
import { useFilteredEvents } from "@/lib/hooks/useFilteredEvents";
import { TimelineEventCard } from "./timeline-event-card";

export function TimelineView() {
  const isGenerating = useTimelineStore((s) => s.isGenerating);
  const timeline = useTimelineStore((s) => s.currentTimeline);
  const events = useFilteredEvents();

  if (!timeline) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-zinc-500">No timeline generated yet</p>
        <p className="text-xs text-zinc-600 mt-1">
          Go to the home page and enter a premise
        </p>
      </div>
    );
  }

  // Group events by era (every ~50 years)
  const getEraLabel = (year: number): string => {
    if (year < 0) return `${Math.abs(year)} BC`;
    if (year < 500) return "Ancient Era";
    if (year < 1500) return "Medieval Era";
    if (year < 1800) return "Early Modern Era";
    if (year < 1900) return "Industrial Era";
    if (year < 2000) return "Modern Era";
    return "Contemporary Era";
  };

  let lastEra = "";

  return (
    <div className="relative py-8">
      {/* Divergence point */}
      {timeline.divergenceYear > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center mb-12"
        >
          <div className="inline-flex flex-col items-center gap-2 rounded-2xl border border-amber-500/20 bg-amber-500/5 px-6 py-4">
            <span className="text-xs text-amber-400 uppercase tracking-wider font-medium">
              Point of Divergence &mdash; {timeline.divergenceYear}
            </span>
            <p className="text-sm text-zinc-300 max-w-md">
              {timeline.divergenceDescription}
            </p>
          </div>
        </motion.div>
      )}

      {/* Timeline spine */}
      <div className="timeline-spine" />

      {/* Events */}
      <div className="relative space-y-6">
        {events.map((event, index) => {
          const era = getEraLabel(event.year);
          const showEraMarker = era !== lastEra;
          lastEra = era;

          return (
            <div key={event.id}>
              {showEraMarker && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-center mb-4"
                >
                  <span className="bg-zinc-950 px-4 py-1 text-[10px] text-zinc-500 uppercase tracking-widest font-medium relative z-10">
                    {era}
                  </span>
                </motion.div>
              )}
              <TimelineEventCard
                event={event}
                index={index}
                side={index % 2 === 0 ? "left" : "right"}
              />
            </div>
          );
        })}
      </div>

      {/* Generating indicator */}
      {isGenerating && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center gap-2 py-8 text-amber-400"
        >
          <Loader2 size={16} className="animate-spin" />
          <span className="text-sm">Generating events...</span>
        </motion.div>
      )}
    </div>
  );
}
