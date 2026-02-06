"use client";

import { useState, useEffect } from "react";
import { GitBranch, AlertCircle } from "lucide-react";
import { PremiseInput } from "@/components/premise/premise-input";
import { PremiseExamples } from "@/components/premise/premise-examples";
import { useGenerateTimeline } from "@/lib/hooks/useGenerateTimeline";
import { useSettingsStore } from "@/lib/store/settings-store";

export default function HomePage() {
  const [inputValue, setInputValue] = useState("");
  const [mounted, setMounted] = useState(false);
  const { generate, isLoading } = useGenerateTimeline();
  const apiKey = useSettingsStore((s) => s.getActiveKey());
  const provider = useSettingsStore((s) => s.provider);

  useEffect(() => setMounted(true), []);

  const handleGenerate = (premise: string) => {
    generate(premise);
  };

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center py-16">
      <div className="w-full max-w-2xl space-y-10">
        {/* Hero */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/5 px-4 py-1.5 text-sm text-amber-400">
            <GitBranch size={14} />
            Alternative History Explorer
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
            What if history took
            <br />
            <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
              a different path?
            </span>
          </h1>
          <p className="text-zinc-400 text-lg max-w-md mx-auto">
            Enter an alternative history premise and watch AI generate a
            detailed timeline of cascading consequences.
          </p>
        </div>

        {/* API Key Warning — only render after mount to avoid hydration mismatch */}
        {mounted && !apiKey && (
          <div className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3">
            <AlertCircle size={18} className="text-amber-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm text-amber-200">API key required</p>
              <p className="text-xs text-amber-400/70 mt-0.5">
                Configure your {provider === "openai" ? "OpenAI" : "Anthropic"} API key in{" "}
                <a href="/settings" className="underline hover:text-amber-300">
                  Settings
                </a>{" "}
                to start generating timelines.
              </p>
            </div>
          </div>
        )}

        {/* Input */}
        <PremiseInput
          onSubmit={handleGenerate}
          isLoading={isLoading}
          initialValue={inputValue}
        />

        {/* Examples */}
        <PremiseExamples
          onSelect={(example) => {
            setInputValue(example);
            handleGenerate(example);
          }}
        />
      </div>
    </div>
  );
}
