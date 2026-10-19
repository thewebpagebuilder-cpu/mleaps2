import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title:
    "Mleaps Consulting · Six Sigma Green Belt Certification Assessment",
  description:
    "The official Six Sigma Green Belt Certification Assessment by Mleaps Consulting — a proctored, time-windowed examination with institutional-grade evaluation and DMAIC analytics.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body
        style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}
        className="canvas-texture text-[#15172a] antialiased min-h-screen selection:bg-[#e2630f]/20 selection:text-[#15172a] overflow-x-hidden"
      >
        {children}
      </body>
    </html>
  );
}
