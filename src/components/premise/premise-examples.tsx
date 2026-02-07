"use client";

import { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";

const ALL_EXAMPLES = [
  "What if the Roman Empire never fell?",
  "What if the Library of Alexandria was never destroyed?",
  "What if the printing press was invented 500 years earlier?",
  "What if the Black Plague never reached Europe?",
  "What if the American Revolution failed?",
  "What if the Soviet Union won the Space Race to the Moon?",
  "What if the Internet was invented in the 1950s?",
  "What if Napoleon won at Waterloo?",
  "What if China discovered the Americas before Columbus?",
  "What if electricity was never harnessed?",
  "What if the dinosaurs never went extinct?",
  "What if the Ottoman Empire conquered Vienna?",
  "What if Einstein was never born?",
  "What if World War I never happened?",
  "What if humans never developed agriculture?",
  "What if the Mongol Empire never fragmented?",
  "What if Nikola Tesla won the War of Currents?",
  "What if the French Revolution never happened?",
  "What if penicillin was never discovered?",
  "What if the Berlin Wall never fell?",
];

function shuffleAndPick(arr: string[], count: number): string[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

interface PremiseExamplesProps {
  onSelect: (premise: string) => void;
}

export function PremiseExamples({ onSelect }: PremiseExamplesProps) {
  const [examples, setExamples] = useState<string[]>([]);

  useEffect(() => {
    setExamples(shuffleAndPick(ALL_EXAMPLES, 8));
  }, []);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
        <Sparkles size={12} />
        <span>Try an example</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {examples.map((example) => (
          <button
            key={example}
            onClick={() => onSelect(example)}
            className="rounded-full border border-zinc-200 dark:border-white/[0.06] bg-zinc-50 dark:bg-white/[0.02] px-4 py-2 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/[0.06] hover:border-amber-500/20 transition-all duration-200 cursor-pointer"
          >
            {example}
          </button>
        ))}
      </div>
    </div>
  );
}
