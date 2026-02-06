"use client";

import { useMemo } from "react";
import { useTimelineStore } from "@/lib/store/timeline-store";
import { useUIStore } from "@/lib/store/ui-store";
import type { TimelineEvent } from "@/types/timeline";

export function useFilteredEvents() {
  const events = useTimelineStore((s) => s.currentTimeline?.events ?? []);
  const activeCategories = useUIStore((s) => s.activeCategories);
  const timeRangeStart = useUIStore((s) => s.timeRangeStart);
  const timeRangeEnd = useUIStore((s) => s.timeRangeEnd);

  const filteredEvents = useMemo(() => {
    return events.map((event: TimelineEvent) => {
      const categoryMatch =
        activeCategories.size === 0 || activeCategories.has(event.category);
      const timeMatch =
        (timeRangeStart === null || event.year >= timeRangeStart) &&
        (timeRangeEnd === null || event.year <= timeRangeEnd);
      return {
        ...event,
        isFiltered: !(categoryMatch && timeMatch),
      };
    });
  }, [events, activeCategories, timeRangeStart, timeRangeEnd]);

  const sortedEvents = useMemo(() => {
    return [...filteredEvents].sort((a, b) => a.year - b.year);
  }, [filteredEvents]);

  return sortedEvents;
}
