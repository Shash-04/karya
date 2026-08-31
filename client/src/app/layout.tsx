import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/providers/Providers";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Karya | Async Job Processing Engine",
  description:
    "A Redis-backed job queue with a concurrent worker pool, automatic retries, delayed scheduling, and live WebSocket task updates.",
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
