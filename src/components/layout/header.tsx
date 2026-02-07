"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings, BookmarkCheck, GitBranch, Menu } from "lucide-react";
import { useUIStore } from "@/lib/store/ui-store";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/explore", label: "Explore" },
  { href: "/compare", label: "Compare" },
];

export function Header() {
  const pathname = usePathname();
  const setSidebarOpen = useUIStore((s) => s.setSidebarOpen);
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 dark:border-white/[0.06] bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-600 shadow-lg shadow-amber-900/30">
              <GitBranch size={16} className="text-white" />
            </div>
            <span className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight">
              Re<span className="text-amber-500">history</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? "bg-zinc-200 dark:bg-white/10 text-zinc-900 dark:text-white"
                    : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="relative p-2 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
            title="Saved Timelines"
          >
            <BookmarkCheck size={18} />
          </button>
          <Link
            href="/settings"
            className={`p-2 rounded-lg transition-colors ${
              pathname === "/settings"
                ? "bg-zinc-200 dark:bg-white/10 text-zinc-900 dark:text-white"
                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5"
            }`}
          >
            <Settings size={18} />
          </Link>
          <button
            className="md:hidden p-2 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
