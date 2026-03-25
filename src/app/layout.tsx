import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { FontSizeProvider } from "@/components/layout/font-size-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ReHi — Alternative History Explorer",
  description:
    "Explore alternative history timelines with AI-generated cascading consequences",
  icons: {
    icon: [
      { url: "/Rehistory/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/Rehistory/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/Rehistory/apple-touch-icon.png",
  },
  manifest: "/Rehistory/site.webmanifest",
  openGraph: {
    title: "ReHi — Alternative History Explorer",
    description:
      "Explore alternative history timelines with AI-generated cascading consequences",
    images: [
      {
        url: "/Rehistory/og-image.webp",
        width: 1200,
        height: 630,
        type: "image/webp",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ReHi — Alternative History Explorer",
    description:
      "Explore alternative history timelines with AI-generated cascading consequences",
    images: ["/Rehistory/og-image.webp"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 min-h-screen`}
      >
        <FontSizeProvider />
        <Header />
        <Sidebar />
        <main className="mx-auto max-w-7xl px-4">{children}</main>
        <footer className="text-center py-4 text-[10px] text-zinc-400 dark:text-zinc-700">v0.19</footer>
      </body>
    </html>
  );
}
