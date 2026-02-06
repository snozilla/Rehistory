import { create } from "zustand";
import { persist } from "zustand/middleware";
import { nanoid } from "nanoid";
import type { GeneratedTimeline, SavedTimeline, TimelineEvent, EventConnection } from "@/types/timeline";

interface TimelineState {
  // Current generation
  currentTimeline: GeneratedTimeline | null;
  isGenerating: boolean;
  error: string | null;

  // Saved timelines
  savedTimelines: SavedTimeline[];

  // Actions
  startGeneration: (premise: string) => string;
  addEvent: (event: TimelineEvent) => void;
  addConnection: (connection: EventConnection) => void;
  addRealHistoryEvent: (event: TimelineEvent) => void;
  setDivergence: (year: number, description: string) => void;
  setCurrentTimeline: (timeline: GeneratedTimeline) => void;
  updateCurrentTimeline: (partial: Partial<GeneratedTimeline>) => void;
  finishGeneration: () => void;
  setError: (error: string | null) => void;
  saveTimeline: () => string | null;
  deleteSavedTimeline: (id: string) => void;
  loadTimeline: (id: string) => boolean;
  clearCurrent: () => void;
}

export const useTimelineStore = create<TimelineState>()(
  persist(
    (set, get) => ({
      currentTimeline: null,
      isGenerating: false,
      error: null,
      savedTimelines: [],

      startGeneration: (premise: string) => {
        const id = nanoid();
        set({
          currentTimeline: {
            id,
            premise,
            divergenceYear: 0,
            divergenceDescription: "",
            events: [],
            connections: [],
            realHistoryEvents: [],
            createdAt: Date.now(),
          },
          isGenerating: true,
          error: null,
        });
        return id;
      },

      addEvent: (event) => {
        const { currentTimeline } = get();
        if (!currentTimeline) return;
        set({
          currentTimeline: {
            ...currentTimeline,
            events: [...currentTimeline.events, event],
          },
        });
      },

      addConnection: (connection) => {
        const { currentTimeline } = get();
        if (!currentTimeline) return;
        set({
          currentTimeline: {
            ...currentTimeline,
            connections: [...currentTimeline.connections, connection],
          },
        });
      },

      addRealHistoryEvent: (event) => {
        const { currentTimeline } = get();
        if (!currentTimeline) return;
        set({
          currentTimeline: {
            ...currentTimeline,
            realHistoryEvents: [...currentTimeline.realHistoryEvents, event],
          },
        });
      },

      setDivergence: (year, description) => {
        const { currentTimeline } = get();
        if (!currentTimeline) return;
        set({
          currentTimeline: {
            ...currentTimeline,
            divergenceYear: year,
            divergenceDescription: description,
          },
        });
      },

      setCurrentTimeline: (timeline) => {
        set({ currentTimeline: timeline, isGenerating: false, error: null });
      },

      updateCurrentTimeline: (partial) => {
        const { currentTimeline } = get();
        if (!currentTimeline) return;
        set({ currentTimeline: { ...currentTimeline, ...partial } });
      },

      finishGeneration: () => {
        set({ isGenerating: false });
      },

      setError: (error) => {
        set({ error, isGenerating: false });
      },

      saveTimeline: () => {
        const { currentTimeline, savedTimelines } = get();
        if (!currentTimeline) return null;
        const id = nanoid();
        const saved: SavedTimeline = {
          id,
          premise: currentTimeline.premise,
          timeline: currentTimeline,
          savedAt: Date.now(),
        };
        set({ savedTimelines: [...savedTimelines, saved] });
        return id;
      },

      deleteSavedTimeline: (id) => {
        const { savedTimelines } = get();
        set({ savedTimelines: savedTimelines.filter((s) => s.id !== id) });
      },

      loadTimeline: (id) => {
        const { savedTimelines } = get();
        const saved = savedTimelines.find((s) => s.id === id);
        if (!saved) return false;
        set({ currentTimeline: saved.timeline, isGenerating: false, error: null });
        return true;
      },

      clearCurrent: () => {
        set({ currentTimeline: null, isGenerating: false, error: null });
      },
    }),
    {
      name: "rehi-timelines",
      partialize: (state) => ({ savedTimelines: state.savedTimelines }),
    }
  )
);
