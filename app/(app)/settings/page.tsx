"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { ThemeToggle } from "@/components/theme_toggle";
import { useAuth } from "@/components/auth-provider";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";

const MIN_PASSWORD_LENGTH = 8;

export default function SettingsPage() {
  const { user, profile, isLoading, isLoadingProfile, signOut } = useAuth();
  const supabase = getSupabaseBrowserClient();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const isLoadingAuthState = useMemo(
    () => isLoading || isLoadingProfile,
    [isLoading, isLoadingProfile]
  );

  useEffect(() => {
    if (isLoadingAuthState) return;
    if (!user) {
      router.replace("/login?redirectTo=/settings");
    }
  }, [isLoadingAuthState, router, user]);

  useEffect(() => {
    const nextName =
      profile?.name ?? user?.user_metadata?.name ?? user?.email ?? "";
    setName(nextName);
    setEmail(user?.email ?? profile?.email ?? "");
  }, [profile?.email, profile?.name, user?.email, user?.user_metadata?.name]);

  const handleProfileSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;

    setProfileMessage(null);
    setProfileError(null);
    setIsSavingProfile(true);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    try {
      const { error: authError } = await supabase.auth.updateUser({
        email: trimmedEmail,
        data: { name: trimmedName },
      });

      if (authError) throw authError;

      const { error: updateError } = await supabase
        .from("user")
        .update({ name: trimmedName, email: trimmedEmail })
        .eq("id", user.id);

      if (updateError) throw updateError;

      setProfileMessage("Profilen uppdaterades.");
    } catch (updateProfileError) {
      setProfileError(
        updateProfileError instanceof Error
          ? updateProfileError.message
          : String(updateProfileError)
      );
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;

    setPasswordMessage(null);
    setPasswordError(null);

    if (password !== passwordConfirm) {
      setPasswordError("Lösenorden matchar inte.");
      return;
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      setPasswordError(
        `Lösenordet måste vara minst ${MIN_PASSWORD_LENGTH} tecken.`
      );
      return;
    }

    setIsUpdatingPassword(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setPasswordMessage("Lösenordet uppdaterades.");
      setPassword("");
      setPasswordConfirm("");
    } catch (updatePasswordError) {
      setPasswordError(
        updatePasswordError instanceof Error
          ? updatePasswordError.message
          : String(updatePasswordError)
      );
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    setDeleteError(null);

    const confirmed = window.confirm(
      "Är du säker på att du vill radera kontot? Det går inte att ångra."
    );
    if (!confirmed) return;

    setIsDeleting(true);

    try {
      const { error: deleteProfileError } = await supabase
        .from("user")
        .delete()
        .eq("id", user.id);

      if (deleteProfileError) throw deleteProfileError;

      await signOut();
      router.replace("/login");
    } catch (deleteAccountError) {
      setDeleteError(
        deleteAccountError instanceof Error
          ? deleteAccountError.message
          : String(deleteAccountError)
      );
    } finally {
      setIsDeleting(false);
    }
  };

  if (!user && isLoadingAuthState) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <span
          className="loading loading-spinner"
          aria-label="Laddar användare"
        />
      </div>
    );
  }

  return (
    <main className="mx-auto flex-1 flex max-w-5xl flex-col gap-6 px-4 py-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <h1 className="text-3xl font-bold">Inställningar</h1>
        <button className="btn" onClick={() => void signOut()} type="button">
          Logga ut
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card bg-base-200 shadow">
          <div className="card-body space-y-4">
            <h2 className="card-title">Profil</h2>

            {profileMessage && (
              <div className="alert alert-success">{profileMessage}</div>
            )}
            {profileError && (
              <div className="alert alert-error">{profileError}</div>
            )}

            <form className="space-y-4" onSubmit={handleProfileSubmit}>
              <div className="form-control flex flex-col gap-1">
                <label className="label" htmlFor="name">
                  <span className="label-text">Namn</span>
                </label>
                <input
                  id="name"
                  className="input input-bordered"
                  placeholder="Ditt namn"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                />
              </div>

              <div className="form-control flex flex-col gap-1">
                <label className="label" htmlFor="email">
                  <span className="label-text">E-post</span>
                </label>
                <input
                  id="email"
                  type="email"
                  className="input input-bordered"
                  placeholder="du@exempel.se"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>

              <div className="form-control">
                <button
                  className="btn btn-primary btn-md mt-4"
                  type="submit"
                  disabled={isSavingProfile}
                >
                  {isSavingProfile ? "Sparar..." : "Spara ändringar"}
                </button>
              </div>
            </form>
          </div>
        </section>

        <section className="card bg-base-200 shadow">
          <div className="card-body space-y-4">
            <h2 className="card-title">Lösenord</h2>

            {passwordMessage && (
              <div className="alert alert-success">{passwordMessage}</div>
            )}
            {passwordError && (
              <div className="alert alert-error">{passwordError}</div>
            )}

            <form className="space-y-4" onSubmit={handlePasswordSubmit}>
              <div className="form-control flex flex-col gap-1">
                <label className="label" htmlFor="new-password">
                  <span className="label-text">Nytt lösenord</span>
                </label>
                <input
                  id="new-password"
                  type="password"
                  className="input input-bordered"
                  placeholder="••••••••"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  minLength={MIN_PASSWORD_LENGTH}
                />
              </div>

              <div className="form-control flex flex-col gap-1">
                <label className="label" htmlFor="confirm-password">
                  <span className="label-text">Bekräfta nytt lösenord</span>
                </label>
                <input
                  id="confirm-password"
                  type="password"
                  className="input input-bordered"
                  placeholder="••••••••"
                  value={passwordConfirm}
                  onChange={(event) => setPasswordConfirm(event.target.value)}
                  required
                  minLength={MIN_PASSWORD_LENGTH}
                />
              </div>

              <div className="form-control">
                <button
                  className="btn btn-primary mt-4"
                  type="submit"
                  disabled={isUpdatingPassword}
                >
                  {isUpdatingPassword ? "Uppdaterar..." : "Byt lösenord"}
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="card bg-base-200 shadow lg:col-span-2">
          <div className="card-body space-y-4">
            <div>
              <h2 className="card-title">Radera konto</h2>
              <p className="text-sm text-base-content/70">
                Detta tar bort din profil i Coach Pro. Du loggas ut när det är
                klart.
              </p>
            </div>

            {deleteError && (
              <div className="alert alert-error">{deleteError}</div>
            )}

            <div className="space-y-3">
              <button
                type="button"
                className="btn btn-error"
                onClick={handleDeleteAccount}
                disabled={isDeleting}
              >
                {isDeleting ? "Raderar..." : "Radera konto"}
              </button>
            </div>
          </div>
        </section>

        <section className="card bg-base-200 shadow">
          <div className="card-body space-y-4">
            <div>
              <h2 className="card-title">Utseende</h2>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <ThemeToggle
                key="settings-theme-toggle"
                groupName="settings-theme-dropdown"
                dropdownRight={true}
              />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
