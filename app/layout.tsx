import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { SiteNav } from "@/components/site-nav";
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
  title: "Coach Pro · Camp Momentum",
  description: "Plan elite coaching modules with a DaisyUI-powered toolkit.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="emerald">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/daisyui@4.12.14/dist/full.min.css"
          integrity="sha256-B6HiCY6I+CY1suePkN3Im0uMfYvtv/6ZqaArFpE1Cvc="
          crossOrigin="anonymous"
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} bg-white antialiased`}>
        <div className="flex min-h-screen flex-col bg-white text-base-content">
          <SiteNav />
          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}
