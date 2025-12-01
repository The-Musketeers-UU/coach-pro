import "./globals.css";

import { AuthProvider } from "@/components/auth-provider";
import { SiteNav } from "@/components/site-nav";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="light">
      <body className="bg-base-200 text-base-content">
        <AuthProvider>
          <div className="flex min-h-screen flex-col">
            <SiteNav />
            <main className="flex-1">{children}</main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
