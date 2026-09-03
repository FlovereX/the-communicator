"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/shared/Button";
import { Label, TextInput } from "@/components/shared/FormControls";
import { BrandLogo } from "@/components/shared/BrandLogo";
import { createClient } from "@/lib/supabase/client";
import { clearPasswordSetupMarker } from "./actions";

type Stage = "form" | "setup-incomplete";

export default function SetPasswordPage() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("form");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const passwordsMatch = confirmPassword.length === 0 || confirmPassword === newPassword;
  const isValid =
    newPassword.length >= 8 && confirmPassword.length > 0 && newPassword === confirmPassword;

  /** Only ever called after the Auth password update has already succeeded — retries re-run only this. */
  async function completeSetup() {
    const supabase = createClient();
    const { error: rpcError } = await supabase.rpc("complete_password_setup");
    if (rpcError) {
      setIsSubmitting(false);
      setStage("setup-incomplete");
      setError(rpcError.message);
      return;
    }
    await clearPasswordSetupMarker();
    router.push("/dashboard");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid || isSubmitting) return;
    setIsSubmitting(true);
    setError(null);

    const supabase = createClient();
    // No current password required — the freshly-authenticated session is the authorization.
    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
    if (updateError) {
      setIsSubmitting(false);
      setError(updateError.message);
      return;
    }

    await completeSetup();
  }

  function handleRetry() {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError(null);
    completeSetup();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-xl border border-border bg-surface p-8 shadow-sm">
        <div className="mb-6 text-center">
          <BrandLogo priority />
          <p className="mt-2 font-serif text-xl font-bold tracking-tight text-navy">NEWSROOM</p>
        </div>
        {stage === "setup-incomplete" ? (
          <div className="flex flex-col gap-4 text-center">
            <p className="font-serif text-lg font-semibold text-foreground">
              Your password was saved
            </p>
            <p className="text-sm text-foreground/60">
              We couldn&apos;t finish setting up your account. You can try again safely — you
              won&apos;t need to re-enter your password.
            </p>
            {error ? (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-400">
                {error}
              </p>
            ) : null}
            <Button
              type="button"
              variant="primary"
              onClick={handleRetry}
              disabled={isSubmitting}
              className="justify-center"
            >
              {isSubmitting ? "Finishing setup…" : "Finish Setup"}
            </Button>
          </div>
        ) : (
          <>
            <p className="mb-1 text-center font-serif text-lg font-semibold text-foreground">
              Create your password
            </p>
            <p className="mb-4 text-center text-sm text-foreground/60">
              Your email is verified. Create a password for future sign-ins to The Communicator
              Newsroom.
            </p>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="set-password-new">New Password</Label>
                <TextInput
                  id="set-password-new"
                  type="password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setError(null);
                  }}
                  disabled={isSubmitting}
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="set-password-confirm">Confirm Password</Label>
                <TextInput
                  id="set-password-confirm"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setError(null);
                  }}
                  disabled={isSubmitting}
                  required
                />
              </div>
              {newPassword.length > 0 && newPassword.length < 8 ? (
                <p className="text-xs text-foreground/50">
                  Password must be at least 8 characters.
                </p>
              ) : null}
              {!passwordsMatch ? (
                <p className="text-xs text-red-700 dark:text-red-400">Passwords do not match.</p>
              ) : null}
              {error ? (
                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-400">
                  {error}
                </p>
              ) : null}
              <Button
                type="submit"
                variant="primary"
                disabled={!isValid || isSubmitting}
                className="justify-center"
              >
                {isSubmitting ? "Creating…" : "Create Password"}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
