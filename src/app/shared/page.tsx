"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TimelineView } from "@/components/timeline/timeline-view";
import { useTimelineStore } from "@/lib/store/timeline-store";
import { decompressTimeline } from "@/lib/utils/share";
import type { GeneratedTimeline } from "@/types/timeline";

function SharedContent() {
  const searchParams = useSearchParams();
  const setCurrentTimeline = useTimelineStore((s) => s.setCurrentTimeline);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const id = searchParams.get("id");
    const data = searchParams.get("data");

    if (data) {
      const timeline = decompressTimeline(data);
      if (timeline) {
        setCurrentTimeline(timeline);
      } else {
        setError("Failed to decompress timeline data");
      }
    } else if (id) {
      const stored = localStorage.getItem(`rehi-shared-${id}`);
      if (stored) {
        try {
          const timeline = JSON.parse(stored) as GeneratedTimeline;
          setCurrentTimeline(timeline);
        } catch {
          setError("Failed to load shared timeline");
        }
      } else {
        setError("Shared timeline not found");
      }
    } else {
      setError("No timeline data provided");
    }
    setLoading(false);
  }, [searchParams, setCurrentTimeline]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={24} className="animate-spin text-amber-500 dark:text-amber-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <p className="text-zinc-500 dark:text-zinc-400">{error}</p>
        <Link href="/">
          <Button variant="secondary" size="sm">
            <ArrowLeft size={14} />
            Go Home
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="py-8 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft size={14} />
            Home
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-white">Shared Timeline</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            Viewing a shared alternative history
          </p>
        </div>
      </div>

      <TimelineView />
    </div>
  );
}

export default function SharedPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-24">
          <Loader2 size={24} className="animate-spin text-amber-500 dark:text-amber-400" />
        </div>
      }
    >
      <SharedContent />
    </Suspense>
  );
}
