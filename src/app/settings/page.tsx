"use client";

import { useState, useEffect } from "react";
import { Eye, EyeOff, Check, Minus, Plus } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSettingsStore } from "@/lib/store/settings-store";
import type { AIProvider } from "@/types/ai";

const OPENAI_MODELS = ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo"];
const ANTHROPIC_MODELS = [
  "claude-sonnet-4-5-20250929",
  "claude-haiku-4-5-20251001",
  "claude-opus-4-6",
];

export default function SettingsPage() {
  const store = useSettingsStore();
  const [showOpenAI, setShowOpenAI] = useState(false);
  const [showAnthropic, setShowAnthropic] = useState(false);
  const [saved, setSaved] = useState(false);

  // Local state to avoid hydration mismatch
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="py-16 max-w-xl mx-auto">
        <div className="h-8 w-48 bg-zinc-100 dark:bg-white/5 rounded animate-pulse" />
      </div>
    );
  }

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="py-16 max-w-xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Settings</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Configure your AI provider and API keys
        </p>
      </div>

      {/* Provider Selection */}
      <Card>
        <CardHeader>
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">AI Provider</h2>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {(["openai", "anthropic"] as AIProvider[]).map((p) => (
              <button
                key={p}
                onClick={() => store.setProvider(p)}
                className={`rounded-lg border px-4 py-3 text-left transition-all cursor-pointer ${
                  store.provider === p
                    ? "border-amber-500/40 bg-amber-500/10"
                    : "border-zinc-200 dark:border-white/[0.06] bg-zinc-50 dark:bg-white/[0.02] hover:bg-zinc-100 dark:hover:bg-white/[0.04]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      store.provider === p ? "bg-amber-400" : "bg-zinc-300 dark:bg-zinc-600"
                    }`}
                  />
                  <span
                    className={`text-sm font-medium ${
                      store.provider === p ? "text-zinc-900 dark:text-white" : "text-zinc-500 dark:text-zinc-400"
                    }`}
                  >
                    {p === "openai" ? "OpenAI" : "Anthropic"}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1 ml-4">
                  {p === "openai" ? "GPT-4o, GPT-4 Turbo" : "Claude Sonnet, Haiku, Opus"}
                </p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* OpenAI Config */}
      <Card>
        <CardHeader>
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">OpenAI Configuration</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-xs text-zinc-500 dark:text-zinc-400 mb-1.5">API Key</label>
            <div className="relative">
              <input
                type={showOpenAI ? "text" : "password"}
                value={store.openaiKey}
                onChange={(e) => store.setOpenaiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full rounded-lg border border-zinc-200 dark:border-white/[0.08] bg-zinc-50 dark:bg-white/[0.03] px-3 py-2 pr-10 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:border-amber-500/30 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowOpenAI(!showOpenAI)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 cursor-pointer"
              >
                {showOpenAI ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs text-zinc-500 dark:text-zinc-400 mb-1.5">Model</label>
            <select
              value={store.openaiModel}
              onChange={(e) => store.setOpenaiModel(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 dark:border-white/[0.08] bg-zinc-50 dark:bg-white/[0.03] px-3 py-2 text-sm text-zinc-900 dark:text-white focus:border-amber-500/30 focus:outline-none"
            >
              {OPENAI_MODELS.map((m) => (
                <option key={m} value={m} className="bg-white dark:bg-zinc-900">
                  {m}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Anthropic Config */}
      <Card>
        <CardHeader>
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">
            Anthropic Configuration
          </h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-xs text-zinc-500 dark:text-zinc-400 mb-1.5">API Key</label>
            <div className="relative">
              <input
                type={showAnthropic ? "text" : "password"}
                value={store.anthropicKey}
                onChange={(e) => store.setAnthropicKey(e.target.value)}
                placeholder="sk-ant-..."
                className="w-full rounded-lg border border-zinc-200 dark:border-white/[0.08] bg-zinc-50 dark:bg-white/[0.03] px-3 py-2 pr-10 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:border-amber-500/30 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowAnthropic(!showAnthropic)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 cursor-pointer"
              >
                {showAnthropic ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs text-zinc-500 dark:text-zinc-400 mb-1.5">Model</label>
            <select
              value={store.anthropicModel}
              onChange={(e) => store.setAnthropicModel(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 dark:border-white/[0.08] bg-zinc-50 dark:bg-white/[0.03] px-3 py-2 text-sm text-zinc-900 dark:text-white focus:border-amber-500/30 focus:outline-none"
            >
              {ANTHROPIC_MODELS.map((m) => (
                <option key={m} value={m} className="bg-white dark:bg-zinc-900">
                  {m}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Font Size */}
      <Card>
        <CardHeader>
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">Font Size</h2>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <button
              onClick={() => store.setFontSize(store.fontSize - 2)}
              disabled={store.fontSize <= 12}
              className="rounded-lg border border-zinc-200 dark:border-white/[0.06] bg-zinc-50 dark:bg-white/[0.02] p-2 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/[0.04] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              <Minus size={16} />
            </button>
            <div className="flex-1 text-center">
              <span className="text-lg font-medium text-zinc-900 dark:text-white">{store.fontSize}px</span>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
                {store.fontSize === 16 ? "Default" : store.fontSize < 16 ? "Smaller" : "Larger"}
              </p>
            </div>
            <button
              onClick={() => store.setFontSize(store.fontSize + 2)}
              disabled={store.fontSize >= 24}
              className="rounded-lg border border-zinc-200 dark:border-white/[0.06] bg-zinc-50 dark:bg-white/[0.02] p-2 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/[0.04] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              <Plus size={16} />
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Timeline Size */}
      <Card>
        <CardHeader>
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">Timeline Size</h2>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Number of alternative history events to generate ({store.eventCount})
          </p>
          <input
            type="range"
            min={5}
            max={50}
            step={5}
            value={store.eventCount}
            onChange={(e) => store.setEventCount(Number(e.target.value))}
            className="w-full accent-amber-500"
          />
          <div className="flex justify-between text-xs text-zinc-400 dark:text-zinc-500">
            <span>5</span>
            <span>15</span>
            <span>25</span>
            <span>35</span>
            <span>50</span>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} className="w-full">
        {saved ? (
          <>
            <Check size={16} /> Saved
          </>
        ) : (
          "Save Settings"
        )}
      </Button>
    </div>
  );
}
