import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
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
    default: "NATS Spirea — Read four books. Win the semester.",
    template: "%s | NATS Spirea",
  },
  description:
    "A semester-long reading league for students: teams of 2–3, one book a month, live Kahoot-style quiz nights, and bonus challenges — the top team wins a scholarship or internship.",
  keywords: ["reading", "gamification", "university", "book club", "quiz", "students"],
  icons: {
    icon:  "/logo_451.png",
    apple: "/logo_451.png",
  },
  openGraph: {
    type: "website",
    siteName: "NATS Spirea",
  },
};

export const viewport: Viewport = {
  themeColor: "#ff6b2c",
  colorScheme: "light dark",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* Runs before hydration — reads localStorage and applies .light class to avoid flash */}
        <script
          id="theme-init"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('berea-theme'),l=window.matchMedia('(prefers-color-scheme:light)').matches;if(t==='light'||(t===null&&l)){document.documentElement.classList.add('light');}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
