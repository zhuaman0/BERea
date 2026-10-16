import { Space_Grotesk, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./reading.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets:  ["latin"],
  display:  "swap",
});

const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-ibm-plex-sans",
  subsets:  ["latin"],
  weight:   ["400", "500", "600"],
  display:  "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets:  ["latin"],
  weight:   ["400", "500"],
  display:  "swap",
});

export default function ReadingRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`reading-theme fixed inset-0 overflow-hidden ${spaceGrotesk.variable} ${ibmPlexSans.variable} ${ibmPlexMono.variable}`}
    >
      {children}
    </div>
  );
}
