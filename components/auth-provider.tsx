"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { ensureUserForAuth, type AthleteRow } from "@/lib/supabase/training-modules";

import type { Session, User } from "@supabase/supabase-js";

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  profile: AthleteRow | null;
  isLoading: boolean;
  isLoadingProfile: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const supabaseBrowserClient = getSupabaseBrowserClient();
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<AthleteRow | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isLoadingSession, setIsLoadingSession] = useState(true);

  useEffect(() => {
    const getInitialSession = async () => {
      const { data, error } = await supabaseBrowserClient.auth.getSession();
      if (!error) {
        setSession(data.session);
      }
      setIsLoadingSession(false);
    };

    void getInitialSession();

    const { data } = supabaseBrowserClient.auth.onAuthStateChange((_, nextSession) => {
      setSession(nextSession);
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!session?.user) {
      setProfile(null);
      return;
    }

    const syncProfile = async () => {
      setIsLoadingProfile(true);
      try {
        const userProfile = await ensureUserForAuth(session.user);
        setProfile(userProfile);
      } catch (profileError) {
        console.error("Failed to sync profile", profileError);
        setProfile(null);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    void syncProfile();
  }, [session]);

  const signOut = useCallback(async () => {
    await supabaseBrowserClient.auth.signOut();
    router.push("/login");
  }, [router]);

  const combinedIsLoading = isLoadingSession || isLoadingProfile;

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      session,
      profile,
      isLoading: combinedIsLoading,
      isLoadingProfile,
      signOut,
    }),
    [session, combinedIsLoading, isLoadingProfile, profile, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading || pathname === "/login") return;
    if (!user) {
      const redirectTo = encodeURIComponent(pathname || "/");
      router.replace(`/login?redirectTo=${redirectTo}`);
    }
  }, [user, isLoading, pathname, router]);

  if (pathname === "/login") return children;

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <span className="loading loading-spinner" aria-label="Checking session" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
