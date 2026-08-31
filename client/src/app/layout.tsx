import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/providers/Providers";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://karya-uvpz-jade.vercel.app"),
  title: {
    default: "Karya — Async Job & Queue Engine",
    template: "%s · Karya",
  },
  description:
    "A Redis-backed job queue with a concurrent worker pool, automatic retries, delayed scheduling, and live WebSocket task updates.",
  applicationName: "Karya",
  keywords: [
    "job queue",
    "async processing",
    "worker pool",
    "task scheduler",
    "Redis",
    "Spring Boot",
  ],
  authors: [{ name: "Shashwat Vaish" }],
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
  },
  openGraph: {
    type: "website",
    title: "Karya — Async Job & Queue Engine",
    description:
      "A Redis-backed job queue with a concurrent worker pool, automatic retries, delayed scheduling, and live WebSocket task updates.",
    siteName: "Karya",
  },
  twitter: {
    card: "summary",
    title: "Karya — Async Job & Queue Engine",
    description:
      "Redis-backed job queue with a concurrent worker pool, retries, delayed scheduling, and live task updates.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full ${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-full flex flex-col bg-background text-foreground antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
