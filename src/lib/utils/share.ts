import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from "lz-string";
import type { GeneratedTimeline } from "@/types/timeline";

const MAX_URL_LENGTH = 6000;

export function compressTimeline(timeline: GeneratedTimeline): string {
  const json = JSON.stringify(timeline);
  return compressToEncodedURIComponent(json);
}

export function decompressTimeline(compressed: string): GeneratedTimeline | null {
  try {
    const json = decompressFromEncodedURIComponent(compressed);
    if (!json) return null;
    return JSON.parse(json) as GeneratedTimeline;
  } catch {
    return null;
  }
}

export function createShareUrl(timeline: GeneratedTimeline): {
  url: string;
  method: "url" | "localStorage";
} {
  const compressed = compressTimeline(timeline);
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const url = `${baseUrl}/shared/${timeline.id}?data=${compressed}`;

  if (url.length > MAX_URL_LENGTH) {
    // Store in localStorage and share by ID only
    if (typeof window !== "undefined") {
      localStorage.setItem(`rehi-shared-${timeline.id}`, JSON.stringify(timeline));
    }
    return {
      url: `${baseUrl}/shared/${timeline.id}`,
      method: "localStorage",
    };
  }

  return { url, method: "url" };
}
