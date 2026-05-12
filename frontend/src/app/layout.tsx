import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "BERea — Discover how YOU learn best",
    template: "%s | BERea",
  },
  description:
    "Stop guessing. Start testing. BERea helps students find study methods that actually work for their brain.",
  keywords: ["study", "pomodoro", "flashcards", "IELTS", "learning", "focus"],
  openGraph: {
    type: "website",
    siteName: "BERea",
  },
};

export const viewport: Viewport = {
  themeColor: "#6366f1",
  colorScheme: "light dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
