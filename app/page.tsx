"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/components/auth-provider";

export default function HomePage() {
  const router = useRouter();
  const { profile, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    const target = profile?.isCoach ? "/dashboard" : "/athlete";
    router.replace(target);
  }, [isLoading, profile?.isCoach, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <span className="loading loading-spinner" aria-label="Omdirigerar" />
    </div>
  );
}
