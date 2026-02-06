import type { EventCategory } from "@/types/timeline";

export const categoryColors: Record<
  EventCategory,
  { bg: string; text: string; border: string; dot: string }
> = {
  Politics: {
    bg: "bg-blue-500/15",
    text: "text-blue-400",
    border: "border-blue-500/30",
    dot: "bg-blue-400",
  },
  Technology: {
    bg: "bg-emerald-500/15",
    text: "text-emerald-400",
    border: "border-emerald-500/30",
    dot: "bg-emerald-400",
  },
  Culture: {
    bg: "bg-purple-500/15",
    text: "text-purple-400",
    border: "border-purple-500/30",
    dot: "bg-purple-400",
  },
  Economy: {
    bg: "bg-amber-500/15",
    text: "text-amber-400",
    border: "border-amber-500/30",
    dot: "bg-amber-400",
  },
  Military: {
    bg: "bg-red-500/15",
    text: "text-red-400",
    border: "border-red-500/30",
    dot: "bg-red-400",
  },
  Science: {
    bg: "bg-cyan-500/15",
    text: "text-cyan-400",
    border: "border-cyan-500/30",
    dot: "bg-cyan-400",
  },
  Society: {
    bg: "bg-pink-500/15",
    text: "text-pink-400",
    border: "border-pink-500/30",
    dot: "bg-pink-400",
  },
};

export const categoryColorValues: Record<EventCategory, string> = {
  Politics: "#3b82f6",
  Technology: "#10b981",
  Culture: "#a855f7",
  Economy: "#f59e0b",
  Military: "#ef4444",
  Science: "#06b6d4",
  Society: "#ec4899",
};
