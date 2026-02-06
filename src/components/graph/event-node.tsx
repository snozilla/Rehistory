"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { categoryColors } from "@/lib/utils/category-colors";
import { useUIStore } from "@/lib/store/ui-store";
import type { EventNode as EventNodeType } from "@/types/graph";
import type { EventCategory } from "@/types/timeline";

const fallbackColors = { bg: "bg-zinc-500/15", text: "text-zinc-400", border: "border-zinc-500/30", dot: "bg-zinc-400" };

function EventNodeComponent({ data, id }: NodeProps<EventNodeType>) {
  const { event, expanded, filtered } = data;
  const toggleNodeExpansion = useUIStore((s) => s.toggleNodeExpansion);
  const colors = categoryColors[event.category as EventCategory] ?? fallbackColors;

  return (
    <div
      onClick={() => toggleNodeExpansion(id)}
      className={`rounded-xl border ${colors.border} ${colors.bg} p-3 w-[260px] cursor-pointer transition-all hover:scale-[1.02] ${
        filtered ? "opacity-25" : "opacity-100"
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-amber-500 !border-none !w-2 !h-2"
      />

      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] font-mono text-zinc-500">{event.year}</span>
        <span className={`text-[10px] font-medium ${colors.text}`}>
          {event.category}
        </span>
      </div>

      <h4 className="text-xs font-semibold text-white leading-snug">
        {event.title}
      </h4>

      {/* Significance */}
      <div className="flex items-center gap-0.5 mt-1.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={`h-1 w-1 rounded-full ${
              i < event.significance ? colors.dot : "bg-white/10"
            }`}
          />
        ))}
      </div>

      {expanded && (
        <p className="text-[11px] text-zinc-400 leading-relaxed mt-2 pt-2 border-t border-white/[0.06]">
          {event.description}
        </p>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-amber-500 !border-none !w-2 !h-2"
      />
    </div>
  );
}

export const EventNode = memo(EventNodeComponent);
