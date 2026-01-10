import "./globals.css";
import { cookies } from "next/headers";
import { AuthProvider } from "@/components/auth-provider";
import { sanitizeTheme } from "@/lib/themes";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const theme = sanitizeTheme(cookieStore.get("theme")?.value);

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
