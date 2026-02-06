"use client";

import { useState } from "react";
import { Copy, Check, Link2 } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTimelineStore } from "@/lib/store/timeline-store";
import { createShareUrl } from "@/lib/utils/share";

interface ShareDialogProps {
  open: boolean;
  onClose: () => void;
}

export function ShareDialog({ open, onClose }: ShareDialogProps) {
  const timeline = useTimelineStore((s) => s.currentTimeline);
  const [copied, setCopied] = useState(false);

  if (!timeline) return null;

  const { url, method } = createShareUrl(timeline);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onClose={onClose} title="Share Timeline">
      <div className="space-y-4">
        <p className="text-sm text-zinc-400">
          {method === "url"
            ? "Share this URL to let others view your timeline:"
            : "The timeline is too large for a URL. It has been saved locally. Share this link (works on this device only):"}
        </p>

        <div className="flex items-center gap-2">
          <div className="flex-1 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs text-zinc-300 font-mono truncate">
            {url}
          </div>
          <Button onClick={handleCopy} size="sm" variant="secondary">
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </Button>
        </div>

        {method === "localStorage" && (
          <div className="flex items-start gap-2 rounded-lg bg-amber-500/5 border border-amber-500/20 p-3">
            <Link2 size={14} className="text-amber-400 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-400/80">
              For cross-device sharing, try a shorter premise or fewer events.
            </p>
          </div>
        )}
      </div>
    </Dialog>
  );
}
