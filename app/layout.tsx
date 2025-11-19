import type { Metadata } from "next";
import { SiteNav } from "@/components/site-nav";
import "./globals.css";

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
    <html lang="en" data-theme="light">
      <body>
        <div className="flex min-h-screen flex-col">
          <SiteNav />
          <main className="flex-1">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
