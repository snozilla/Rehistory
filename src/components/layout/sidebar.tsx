"use client";

import { useRouter } from "next/navigation";
import { X, Trash2, Clock } from "lucide-react";
import { useUIStore } from "@/lib/store/ui-store";
import { useTimelineStore } from "@/lib/store/timeline-store";
import { Button } from "@/components/ui/button";

export function Sidebar() {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const setSidebarOpen = useUIStore((s) => s.setSidebarOpen);
  const router = useRouter();
  const savedTimelines = useTimelineStore((s) => s.savedTimelines);
  const loadTimeline = useTimelineStore((s) => s.loadTimeline);
  const deleteSavedTimeline = useTimelineStore((s) => s.deleteSavedTimeline);

  if (!sidebarOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={() => setSidebarOpen(false)}
      />
      <aside className="fixed right-0 top-0 z-50 h-full w-80 border-l border-zinc-200 dark:border-white/[0.06] bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200 dark:border-white/[0.06]">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-white">Saved Timelines</h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-zinc-400 hover:text-zinc-700 dark:hover:text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto h-[calc(100%-57px)] p-4 space-y-3">
          {savedTimelines.length === 0 ? (
            <div className="text-center py-12">
              <Clock size={32} className="mx-auto text-zinc-300 dark:text-zinc-600 mb-3" />
              <p className="text-sm text-zinc-400 dark:text-zinc-500">No saved timelines yet</p>
              <p className="text-xs text-zinc-400 dark:text-zinc-600 mt-1">
                Generate and save a timeline to see it here
              </p>
            </div>
          ) : (
            savedTimelines.map((saved) => (
              <div
                key={saved.id}
                className="group rounded-lg border border-zinc-200 dark:border-white/[0.06] bg-zinc-50 dark:bg-white/[0.02] p-3 hover:bg-zinc-100 dark:hover:bg-white/[0.04] transition-colors"
              >
                <button
                  onClick={() => {
                    loadTimeline(saved.id);
                    setSidebarOpen(false);
                    router.push("/explore");
                  }}
                  className="w-full text-left cursor-pointer"
                >
                  <p className="text-sm font-medium text-zinc-700 dark:text-zinc-200 line-clamp-2">
                    {saved.premise}
                  </p>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1.5">
                    {saved.timeline.events.length} events &middot;{" "}
                    {new Date(saved.savedAt).toLocaleDateString()}
                  </p>
                </button>
                <div className="flex justify-end mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteSavedTimeline(saved.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </aside>
    </>
  );
}
