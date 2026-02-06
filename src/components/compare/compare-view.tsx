"use client";

import { useRef, useEffect, useMemo } from "react";
import { motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { useTimelineStore } from "@/lib/store/timeline-store";
import { useUIStore } from "@/lib/store/ui-store";
import { categoryColors } from "@/lib/utils/category-colors";
import type { EventCategory, TimelineEvent } from "@/types/timeline";

const fallbackColors = { bg: "bg-zinc-500/15", text: "text-zinc-400", border: "border-zinc-500/30", dot: "bg-zinc-400" };

interface YearBucket {
  year: number;
  altEvents: TimelineEvent[];
  realEvents: TimelineEvent[];
}

export function CompareView() {
  const timeline = useTimelineStore((s) => s.currentTimeline);
  const syncScroll = useUIStore((s) => s.syncScroll);
  const setSyncScroll = useUIStore((s) => s.setSyncScroll);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);

  // Sync scroll
  useEffect(() => {
    if (!syncScroll) return;
    const left = leftRef.current;
    const right = rightRef.current;
    if (!left || !right) return;

    let isSyncing = false;

    const syncLeft = () => {
      if (isSyncing) return;
      isSyncing = true;
      right.scrollTop = left.scrollTop;
      isSyncing = false;
    };
    const syncRight = () => {
      if (isSyncing) return;
      isSyncing = true;
      left.scrollTop = right.scrollTop;
      isSyncing = false;
    };

    left.addEventListener("scroll", syncLeft);
    right.addEventListener("scroll", syncRight);
    return () => {
      left.removeEventListener("scroll", syncLeft);
      right.removeEventListener("scroll", syncRight);
    };
  }, [syncScroll]);

  const buckets = useMemo(() => {
    if (!timeline) return [];

    const allYears = new Set<number>();
    timeline.events.forEach((e) => allYears.add(e.year));
    timeline.realHistoryEvents.forEach((e) => allYears.add(e.year));

    const sorted = Array.from(allYears).sort((a, b) => a - b);

    return sorted.map((year): YearBucket => ({
      year,
      altEvents: timeline.events.filter((e) => e.year === year),
      realEvents: timeline.realHistoryEvents.filter((e) => e.year === year),
    }));
  }, [timeline]);

  if (!timeline) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-zinc-500">No timeline to compare</p>
        <p className="text-xs text-zinc-600 mt-1">
          Generate a timeline first to see the comparison
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-zinc-400 cursor-pointer">
          <input
            type="checkbox"
            checked={syncScroll}
            onChange={(e) => setSyncScroll(e.target.checked)}
            className="rounded border-white/10 bg-white/5 text-amber-500 focus:ring-amber-500/30"
          />
          Sync scroll
        </label>
      </div>

      {/* Dual columns */}
      <div className="grid grid-cols-2 gap-4">
        {/* Alt History */}
        <div>
          <div className="sticky top-0 z-10 bg-zinc-950/90 backdrop-blur-sm pb-3 mb-4">
            <h3 className="text-sm font-semibold text-amber-400 flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-amber-400" />
              Alternative Timeline
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5 truncate">
              {timeline.premise}
            </p>
          </div>
          <div
            ref={leftRef}
            className="space-y-3 h-[calc(100vh-16rem)] overflow-y-auto pr-2"
          >
            {buckets.map((bucket, i) => (
              <div key={`alt-${bucket.year}`}>
                {/* Year marker */}
                <div className="text-xs font-mono text-zinc-600 mb-2">
                  {bucket.year}
                </div>
                {bucket.altEvents.length > 0 ? (
                  bucket.altEvents.map((event) => (
                    <CompareEventCard key={event.id} event={event} variant="alt" index={i} />
                  ))
                ) : (
                  <div className="h-16 rounded-lg border border-dashed border-white/[0.04] flex items-center justify-center text-[10px] text-zinc-700">
                    No divergent event
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Real History */}
        <div>
          <div className="sticky top-0 z-10 bg-zinc-950/90 backdrop-blur-sm pb-3 mb-4">
            <h3 className="text-sm font-semibold text-blue-400 flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-blue-400" />
              Real History
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              What actually happened
            </p>
          </div>
          <div
            ref={rightRef}
            className="space-y-3 h-[calc(100vh-16rem)] overflow-y-auto pr-2"
          >
            {buckets.map((bucket, i) => (
              <div key={`real-${bucket.year}`}>
                <div className="text-xs font-mono text-zinc-600 mb-2">
                  {bucket.year}
                </div>
                {bucket.realEvents.length > 0 ? (
                  bucket.realEvents.map((event) => (
                    <CompareEventCard key={event.id} event={event} variant="real" index={i} />
                  ))
                ) : (
                  <div className="h-16 rounded-lg border border-dashed border-white/[0.04] flex items-center justify-center text-[10px] text-zinc-700">
                    No corresponding event
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function CompareEventCard({
  event,
  variant,
  index,
}: {
  event: TimelineEvent;
  variant: "alt" | "real";
  index: number;
}) {
  const colors = categoryColors[event.category as EventCategory] ?? fallbackColors;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className={`rounded-lg border p-3 mb-2 ${
        variant === "alt"
          ? `${colors.border} ${colors.bg}`
          : "border-blue-500/20 bg-blue-500/5"
      }`}
    >
      <div className="flex items-center gap-2 mb-1">
        <Badge
          className={
            variant === "alt"
              ? `${colors.bg} ${colors.text}`
              : "bg-blue-500/15 text-blue-400"
          }
        >
          {event.category}
        </Badge>
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className={`h-1 w-1 rounded-full ${
                i < event.significance
                  ? variant === "alt"
                    ? colors.dot
                    : "bg-blue-400"
                  : "bg-white/10"
              }`}
            />
          ))}
        </div>
      </div>
      <h4 className="text-xs font-semibold text-white">{event.title}</h4>
      <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed line-clamp-3">
        {event.description}
      </p>
    </motion.div>
  );
}
