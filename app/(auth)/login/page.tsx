import { Suspense } from "react";

import LoginClient from "./login-client";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-base-100">Loading login experience...</div>
      }
    >
      <LoginClient />
    </Suspense>
  );
}
