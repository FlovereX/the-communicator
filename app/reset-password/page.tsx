"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/shared/Button";
import { Label, TextInput } from "@/components/shared/FormControls";
import { BrandLogo } from "@/components/shared/BrandLogo";
import { createClient } from "@/lib/supabase/client";
import { clearRecoveryMarker } from "./actions";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDone, setIsDone] = useState(false);

  const passwordsMatch = confirmPassword.length === 0 || confirmPassword === newPassword;
  const isValid =
    newPassword.length >= 8 && confirmPassword.length > 0 && newPassword === confirmPassword;

  function resetFeedback() {
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid || isSubmitting) return;
    setIsSubmitting(true);
    setError(null);

    const supabase = createClient();
    // The recovery session itself is the authorization here — no current password required.
    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
    if (updateError) {
      setIsSubmitting(false);
      setError(updateError.message);
      return;
    }

    // Best-effort: recovery successfully established a password, so also complete initial
    // setup if it was still pending. Never blocks recovery — failures here are ignored.
    await supabase.rpc("complete_password_setup");

    setIsDone(true);
    await clearRecoveryMarker();
    await supabase.auth.signOut();
    router.push("/login?password_reset=1");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-xl border border-border bg-surface p-8 shadow-sm">
        <div className="mb-6 text-center">
          <BrandLogo priority />
          <p className="mt-2 font-serif text-xl font-bold tracking-tight text-navy">NEWSROOM</p>
        </div>
        <p className="mb-4 text-center font-serif text-lg font-semibold text-foreground">
          Set a new password
        </p>
        {isDone ? (
          <p className="text-center text-sm text-emerald-700 dark:text-emerald-400">
            Password updated successfully. Redirecting to sign in…
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="reset-new-password">New Password</Label>
              <TextInput
                id="reset-new-password"
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  resetFeedback();
                }}
                disabled={isSubmitting}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="reset-confirm-password">Confirm New Password</Label>
              <TextInput
                id="reset-confirm-password"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  resetFeedback();
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
              {isSubmitting ? "Updating…" : "Set New Password"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
