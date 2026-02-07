"use client";

import { useEffect } from "react";
import { useSettingsStore } from "@/lib/store/settings-store";

export function FontSizeProvider() {
  const fontSize = useSettingsStore((s) => s.fontSize);

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}px`;
  }, [fontSize]);

  return null;
}
