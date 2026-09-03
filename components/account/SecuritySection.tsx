"use client";

import { useState } from "react";
import { Button } from "@/components/shared/Button";
import { Card } from "@/components/shared/PageHeader";
import { Label, TextInput } from "@/components/shared/FormControls";
import { createClient } from "@/lib/supabase/client";

export function SecuritySection() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const passwordsMatch = confirmPassword.length === 0 || confirmPassword === newPassword;
  const isValid =
    currentPassword.length > 0 &&
    newPassword.length >= 8 &&
    confirmPassword.length > 0 &&
    newPassword === confirmPassword;

  function resetFeedback() {
    setError(null);
    setSuccess(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid || isSubmitting) return;
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({
      current_password: currentPassword,
      password: newPassword,
    });
    setIsSubmitting(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setSuccess(true);
  }

  return (
    <Card className="p-5">
      <h2 className="font-serif text-lg font-semibold text-foreground">Security</h2>
      <form className="mt-4 flex flex-col gap-4 sm:max-w-sm" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="account-current-password">Current Password</Label>
          <TextInput
            id="account-current-password"
            type="password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => {
              setCurrentPassword(e.target.value);
              resetFeedback();
            }}
            disabled={isSubmitting}
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="account-new-password">New Password</Label>
          <TextInput
            id="account-new-password"
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
          <Label htmlFor="account-confirm-password">Confirm New Password</Label>
          <TextInput
            id="account-confirm-password"
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
          <p className="text-xs text-foreground/50">Password must be at least 8 characters.</p>
        ) : null}
        {!passwordsMatch ? (
          <p className="text-xs text-red-700 dark:text-red-400">Passwords do not match.</p>
        ) : null}
        {error ? <p className="text-sm text-red-700 dark:text-red-400">{error}</p> : null}
        {success ? (
          <p className="text-sm text-emerald-700 dark:text-emerald-400">
            Password updated successfully.
          </p>
        ) : null}
        <div>
          <Button type="submit" variant="primary" disabled={!isValid || isSubmitting}>
            {isSubmitting ? "Updating…" : "Change Password"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
