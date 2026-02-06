"use client";

import { Sparkles } from "lucide-react";

const examples = [
  "What if the Roman Empire never fell?",
  "What if the Library of Alexandria was never destroyed?",
  "What if the printing press was invented 500 years earlier?",
  "What if the Black Plague never reached Europe?",
  "What if the American Revolution failed?",
  "What if the Soviet Union won the Space Race to the Moon?",
  "What if the Internet was invented in the 1950s?",
  "What if Napoleon won at Waterloo?",
];

interface PremiseExamplesProps {
  onSelect: (premise: string) => void;
}

export function PremiseExamples({ onSelect }: PremiseExamplesProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs text-zinc-500 uppercase tracking-wider">
        <Sparkles size={12} />
        <span>Try an example</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {examples.map((example) => (
          <button
            key={example}
            onClick={() => onSelect(example)}
            className="rounded-full border border-white/[0.06] bg-white/[0.02] px-4 py-2 text-sm text-zinc-400 hover:text-white hover:bg-white/[0.06] hover:border-amber-500/20 transition-all duration-200 cursor-pointer"
          >
            {example}
          </button>
        ))}
      </div>
    </div>
  );
}
