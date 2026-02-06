"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { categoryColors } from "@/lib/utils/category-colors";
import type { EventCategory, TimelineEvent } from "@/types/timeline";

const fallbackColors = {
  bg: "bg-zinc-500/15",
  text: "text-zinc-400",
  border: "border-zinc-500/30",
  dot: "bg-zinc-400",
};

interface TimelineEventCardProps {
  event: TimelineEvent & { isFiltered?: boolean };
  index: number;
  side: "left" | "right";
}

export function TimelineEventCard({
  event,
  index,
  side,
}: TimelineEventCardProps) {
  const [expanded, setExpanded] = useState(false);
  const colors = categoryColors[event.category as EventCategory] ?? fallbackColors;
  const isFiltered = "isFiltered" in event && event.isFiltered;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, x: side === "left" ? -20 : 20 }}
      animate={{
        opacity: isFiltered ? 0.25 : 1,
        y: 0,
        x: 0,
      }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className={`relative w-[calc(50%-2rem)] ${
        side === "left" ? "mr-auto" : "ml-auto"
      }`}
    >
      {/* Connector line to spine */}
      <div
        className={`absolute top-6 ${
          side === "left" ? "right-0 translate-x-full" : "left-0 -translate-x-full"
        } h-[2px] w-8 bg-gradient-to-r ${
          side === "left"
            ? "from-white/10 to-amber-500/30"
            : "from-amber-500/30 to-white/10"
        }`}
      />

      {/* Dot on spine */}
      <div
        className={`absolute top-[18px] ${
          side === "left" ? "-right-[2.35rem]" : "-left-[2.35rem]"
        } h-3 w-3 rounded-full border-2 border-zinc-950 ${colors.dot} shadow-[0_0_8px_rgba(245,158,11,0.3)]`}
      />

      {/* Card */}
      <div
        className={`rounded-xl border ${colors.border} ${colors.bg} p-4 cursor-pointer transition-all hover:bg-white/[0.06]`}
        onClick={() => setExpanded(!expanded)}
      >
        {/* Year + Category */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono text-zinc-500">{event.year}</span>
          <Badge className={`${colors.bg} ${colors.text}`}>
            {event.category}
          </Badge>
        </div>

        {/* Title */}
        <h3 className="text-sm font-semibold text-white mb-1">{event.title}</h3>

        {/* Significance dots */}
        <div className="flex items-center gap-1 mb-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 w-1.5 rounded-full ${
                i < event.significance ? colors.dot : "bg-white/10"
              }`}
            />
          ))}
          <span className="text-[10px] text-zinc-600 ml-1">impact</span>
        </div>

        {/* Description (expandable) */}
        <motion.div
          initial={false}
          animate={{ height: expanded ? "auto" : 0 }}
          className="overflow-hidden"
        >
          <p className="text-xs text-zinc-400 leading-relaxed pt-2 border-t border-white/[0.06]">
            {event.description}
          </p>
          {event.realWorldCounterpart && (
            <div className="mt-2 rounded-lg bg-white/[0.03] px-3 py-2">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider">
                In our timeline
              </span>
              <p className="text-xs text-zinc-400 mt-0.5">
                {event.realWorldCounterpart}
              </p>
            </div>
          )}
        </motion.div>

        {/* Expand indicator */}
        <div className="flex justify-center mt-2 text-zinc-600">
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </div>
    </motion.div>
  );
}
