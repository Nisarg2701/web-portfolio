import type { Metadata } from "next";
import { Geist, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Nisarg Pakhawala — Software Developer",
  description: "Android, Jetpack Compose, & AI/ML Systems",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${jetbrainsMono.variable} dark antialiased`}
    >
      {/* 
        Using bg-zinc-950 for the Dark Tech & AI Native off-black base.
        Using text-zinc-200 for high-contrast legibility. 
        overflow-x-hidden strictly required by gpt-taste to avoid GSAP horizontal bleed 
      */}
      <body className="min-h-[100dvh] bg-zinc-950 text-zinc-200 overflow-x-hidden selection:bg-emerald-500/30 selection:text-emerald-200">
        {children}
      </body>
    </html>
  );
}
