import "./globals.css";
import { cookies } from "next/headers";
import { AuthProvider } from "@/components/auth-provider";
import { sanitizeTheme } from "@/lib/themes";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const theme = sanitizeTheme(cookies().get("theme")?.value);

  return (
    <html lang="en" data-theme={theme}>
      <body className="bg-base-200 text-base-content">
        <AuthProvider>
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
