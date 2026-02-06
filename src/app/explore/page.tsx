"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { LayoutList, GitBranch, Share2, Bookmark, ArrowLeftRight, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TimelineView } from "@/components/timeline/timeline-view";
import { CategoryFilter } from "@/components/filters/category-filter";
import { ShareDialog } from "@/components/share/share-dialog";
import { useUIStore } from "@/lib/store/ui-store";
import { useTimelineStore } from "@/lib/store/timeline-store";

const BranchingGraphView = dynamic(
  () =>
    import("@/components/graph/branching-graph-view").then(
      (m) => m.BranchingGraphView
    ),
  { ssr: false }
);

export default function ExplorePage() {
  const exploreView = useUIStore((s) => s.exploreView);
  const setExploreView = useUIStore((s) => s.setExploreView);
  const timeline = useTimelineStore((s) => s.currentTimeline);
  const error = useTimelineStore((s) => s.error);
  const saveTimeline = useTimelineStore((s) => s.saveTimeline);
  const [shareOpen, setShareOpen] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  const handleSave = () => {
    saveTimeline();
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  };

  return (
    <div className="py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Explore Timeline</h1>
          {timeline && (
            <p className="text-sm text-zinc-400 mt-0.5 max-w-lg truncate">
              {timeline.premise}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex rounded-lg border border-white/[0.06] bg-white/[0.02] p-0.5">
            <button
              onClick={() => setExploreView("timeline")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                exploreView === "timeline"
                  ? "bg-white/10 text-white"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <LayoutList size={14} />
              Timeline
            </button>
            <button
              onClick={() => setExploreView("graph")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                exploreView === "graph"
                  ? "bg-white/10 text-white"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <GitBranch size={14} />
              Graph
            </button>
          </div>

          {timeline && (
            <>
              <Link href="/compare">
                <Button variant="ghost" size="sm">
                  <ArrowLeftRight size={14} />
                  Compare
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleSave}>
                <Bookmark size={14} />
                {justSaved ? "Saved!" : "Save"}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShareOpen(true)}
              >
                <Share2 size={14} />
                Share
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3">
          <AlertCircle size={18} className="text-red-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm text-red-200">Generation failed</p>
            <p className="text-xs text-red-400/70 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <CategoryFilter />

      {/* View */}
      {exploreView === "timeline" ? <TimelineView /> : <BranchingGraphView />}

      {/* Share dialog */}
      <ShareDialog open={shareOpen} onClose={() => setShareOpen(false)} />
    </div>
  );
}
