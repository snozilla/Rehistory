import { create } from "zustand";
import type { EventCategory } from "@/types/timeline";

type ExploreView = "timeline" | "graph";

interface UIState {
  // View
  exploreView: ExploreView;
  setExploreView: (view: ExploreView) => void;

  // Filters
  activeCategories: Set<EventCategory>;
  toggleCategory: (category: EventCategory) => void;
  clearCategories: () => void;
  setAllCategories: () => void;

  // Time range
  timeRangeStart: number | null;
  timeRangeEnd: number | null;
  setTimeRange: (start: number | null, end: number | null) => void;

  // Graph
  expandedNodes: Set<string>;
  toggleNodeExpansion: (nodeId: string) => void;

  // Compare
  syncScroll: boolean;
  setSyncScroll: (sync: boolean) => void;

  // Sidebar
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const ALL_CATEGORIES: EventCategory[] = [
  "Politics",
  "Technology",
  "Culture",
  "Economy",
  "Military",
  "Science",
  "Society",
];

export const useUIStore = create<UIState>()((set, get) => ({
  exploreView: "timeline",
  setExploreView: (view) => set({ exploreView: view }),

  activeCategories: new Set<EventCategory>(),
  toggleCategory: (category) => {
    const { activeCategories } = get();
    const next = new Set(activeCategories);
    if (next.has(category)) {
      next.delete(category);
    } else {
      next.add(category);
    }
    set({ activeCategories: next });
  },
  clearCategories: () => set({ activeCategories: new Set() }),
  setAllCategories: () => set({ activeCategories: new Set(ALL_CATEGORIES) }),

  timeRangeStart: null,
  timeRangeEnd: null,
  setTimeRange: (start, end) => set({ timeRangeStart: start, timeRangeEnd: end }),

  expandedNodes: new Set<string>(),
  toggleNodeExpansion: (nodeId) => {
    const { expandedNodes } = get();
    const next = new Set(expandedNodes);
    if (next.has(nodeId)) {
      next.delete(nodeId);
    } else {
      next.add(nodeId);
    }
    set({ expandedNodes: next });
  },

  syncScroll: true,
  setSyncScroll: (sync) => set({ syncScroll: sync }),

  sidebarOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));
