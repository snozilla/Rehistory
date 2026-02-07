"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CompareView } from "@/components/compare/compare-view";

export default function ComparePage() {
  return (
    <div className="py-8 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/explore">
          <Button variant="ghost" size="sm">
            <ArrowLeft size={14} />
            Back to Explore
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-white">Compare Timelines</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            Side-by-side: alternative vs. real history
          </p>
        </div>
      </div>

      <CompareView />
    </div>
  );
}
