// app/(auth)/login/layout.tsx
import "./auth.css";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-base-200">
      {/* Titel placerad lite längre ner via translate-y */}
      <h1 className="text-center text-5xl font-semibold tracking-tight text-primary py-[8vh]">
        Coach Pro
      </h1>

      {/* Login-formuläret */}
      <div className="">
        {children}
      </div>
    </div>
  );
}

