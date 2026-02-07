"use client";

import { useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PremiseInputProps {
  onSubmit: (premise: string) => void;
  isLoading?: boolean;
  initialValue?: string;
}

export function PremiseInput({
  onSubmit,
  isLoading = false,
  initialValue = "",
}: PremiseInputProps) {
  const [premise, setPremise] = useState(initialValue);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = premise.trim();
    if (!trimmed || isLoading) return;
    onSubmit(trimmed);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="relative">
        <textarea
          value={premise}
          onChange={(e) => setPremise(e.target.value)}
          placeholder='What if the Roman Empire never fell?'
          className="w-full rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-zinc-50 dark:bg-white/[0.03] px-5 py-4 pr-14 text-base text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:border-amber-500/30 focus:outline-none focus:ring-1 focus:ring-amber-500/20 resize-none transition-all min-h-[100px]"
          rows={3}
          disabled={isLoading}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              handleSubmit(e);
            }
          }}
        />
        <Button
          type="submit"
          disabled={!premise.trim() || isLoading}
          size="sm"
          className="absolute bottom-3 right-3"
        >
          {isLoading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Send size={16} />
          )}
          <span className="sr-only">Generate</span>
        </Button>
      </div>
      <p className="text-xs text-zinc-400 dark:text-zinc-600">
        Press <kbd className="rounded border border-zinc-200 dark:border-white/10 bg-zinc-100 dark:bg-white/5 px-1.5 py-0.5 text-zinc-500 dark:text-zinc-400">Cmd+Enter</kbd> to generate
      </p>
    </form>
  );
}
