import type { Metadata } from "next";
import { Geist, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { RESUME_DATA } from "@/data/resume";

const SITE_URL = "https://nisarg-pakhawala-portfolio.vercel.app";
const TITLE = `${RESUME_DATA.personal.name} — ${RESUME_DATA.personal.role}`;
const DESCRIPTION = `${RESUME_DATA.personal.role} with ${RESUME_DATA.personal.yearsOfExperience} across Android, Python and applied AI. Selected work, experience and certifications.`;

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

// The preview image comes from app/opengraph-image.tsx; Next adds its og:image tags automatically.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: RESUME_DATA.personal.name,
    title: TITLE,
    description: DESCRIPTION,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
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
