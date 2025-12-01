import type { Metadata } from "next";
import "./app.css";
import { SiteNav } from "@/components/site-nav";

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
    <div>
    <SiteNav></SiteNav>
    <>{children}</>
    </div>
  );
}
