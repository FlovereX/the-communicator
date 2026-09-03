"use client";

import { useState } from "react";
import { Button } from "@/components/shared/Button";
import { Label, TextInput } from "@/components/shared/FormControls";
import { createClient } from "@/lib/supabase/client";
import { getAuthConfirmUrl } from "@/lib/site-url";

export function JoinForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSent, setIsSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) return;
    setIsSubmitting(true);
    setError(null);
    const supabase = createClient();
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        data: { full_name: fullName.trim() },
        emailRedirectTo: getAuthConfirmUrl(),
      },
    });
    setIsSubmitting(false);
    if (otpError) {
      setError(otpError.message);
      return;
    }
    setIsSent(true);
  }

  if (isSent) {
    return (
      <div className="text-center">
        <p className="font-serif text-lg font-semibold text-foreground">Check your email</p>
        <p className="mt-2 text-sm text-foreground/60">
          We sent you a verification link. Once verified, your newsroom access request will be
          sent for approval.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="join-name">Full name</Label>
        <TextInput
          id="join-name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          autoComplete="name"
          required
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="join-email">Email</Label>
        <TextInput
          id="join-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />
      </div>
      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-400">
          {error}
        </p>
      ) : null}
      <Button type="submit" variant="primary" disabled={isSubmitting} className="mt-1 justify-center">
        {isSubmitting ? "Sending…" : "Request Access"}
      </Button>
    </form>
  );
}
