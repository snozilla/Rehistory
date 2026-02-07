import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AIProvider } from "@/types/ai";

interface SettingsState {
  provider: AIProvider;
  openaiKey: string;
  anthropicKey: string;
  openaiModel: string;
  anthropicModel: string;
  eventCount: number;
  fontSize: number;
  setProvider: (provider: AIProvider) => void;
  setOpenaiKey: (key: string) => void;
  setAnthropicKey: (key: string) => void;
  setOpenaiModel: (model: string) => void;
  setAnthropicModel: (model: string) => void;
  setEventCount: (count: number) => void;
  setFontSize: (size: number) => void;
  getActiveKey: () => string;
  getActiveModel: () => string;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      provider: "openai",
      openaiKey: "",
      anthropicKey: "",
      openaiModel: "gpt-4o",
      anthropicModel: "claude-sonnet-4-5-20250929",
      eventCount: 20,
      fontSize: 16,
      setProvider: (provider) => set({ provider }),
      setOpenaiKey: (openaiKey) => set({ openaiKey }),
      setAnthropicKey: (anthropicKey) => set({ anthropicKey }),
      setOpenaiModel: (openaiModel) => set({ openaiModel }),
      setAnthropicModel: (anthropicModel) => set({ anthropicModel }),
      setEventCount: (eventCount) => set({ eventCount }),
      setFontSize: (fontSize) => set({ fontSize: Math.min(Math.max(fontSize, 12), 24) }),
      getActiveKey: () => {
        const state = get();
        return state.provider === "openai" ? state.openaiKey : state.anthropicKey;
      },
      getActiveModel: () => {
        const state = get();
        return state.provider === "openai" ? state.openaiModel : state.anthropicModel;
      },
    }),
    { name: "rehi-settings" }
  )
);
