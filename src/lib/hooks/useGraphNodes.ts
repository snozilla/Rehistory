"use client";

import { useMemo } from "react";
import { useTimelineStore } from "@/lib/store/timeline-store";
import { useUIStore } from "@/lib/store/ui-store";
import { createGraphLayout } from "@/lib/utils/graph-layout";

export function useGraphNodes() {
  const events = useTimelineStore((s) => s.currentTimeline?.events ?? []);
  const connections = useTimelineStore(
    (s) => s.currentTimeline?.connections ?? []
  );
  const activeCategories = useUIStore((s) => s.activeCategories);
  const expandedNodes = useUIStore((s) => s.expandedNodes);

  const { nodes, edges } = useMemo(() => {
    if (events.length === 0) return { nodes: [], edges: [] };

    const filteredSet = new Set<string>();
    activeCategories.forEach((c) => filteredSet.add(c));

    return createGraphLayout(events, connections, expandedNodes, filteredSet);
  }, [events, connections, expandedNodes, activeCategories]);

  return { nodes, edges };
}
