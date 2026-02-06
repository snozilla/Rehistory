"use client";

import { useUIStore } from "@/lib/store/ui-store";
import { categoryColors } from "@/lib/utils/category-colors";
import type { EventCategory } from "@/types/timeline";

const CATEGORIES: EventCategory[] = [
  "Politics",
  "Technology",
  "Culture",
  "Economy",
  "Military",
  "Science",
  "Society",
];

export function CategoryFilter() {
  const activeCategories = useUIStore((s) => s.activeCategories);
  const toggleCategory = useUIStore((s) => s.toggleCategory);
  const clearCategories = useUIStore((s) => s.clearCategories);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={clearCategories}
        className={`rounded-full px-3 py-1 text-xs font-medium transition-all cursor-pointer ${
          activeCategories.size === 0
            ? "bg-white/10 text-white"
            : "bg-white/[0.03] text-zinc-500 hover:text-zinc-300"
        }`}
      >
        All
      </button>
      {CATEGORIES.map((cat) => {
        const colors = categoryColors[cat];
        const active = activeCategories.has(cat);
        return (
          <button
            key={cat}
            onClick={() => toggleCategory(cat)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              active
                ? `${colors.bg} ${colors.text} ${colors.border} border`
                : "bg-white/[0.03] text-zinc-500 hover:text-zinc-300 border border-transparent"
            }`}
          >
            <div className={`h-1.5 w-1.5 rounded-full ${colors.dot}`} />
            {cat}
          </button>
        );
      })}
    </div>
  );
}
