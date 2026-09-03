"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/shared/Button";
import { Label, TextInput } from "@/components/shared/FormControls";
import { BrandLogo } from "@/components/shared/BrandLogo";
import { createClient } from "@/lib/supabase/client";
import { getSiteUrl } from "@/lib/site-url";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSent, setIsSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || isSubmitting) return;
    setIsSubmitting(true);
    setError(null);
    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${getSiteUrl()}/reset-password`,
    });
    setIsSubmitting(false);
    // Supabase never reports "no such user" here — any error is a genuine
    // client/network/rate-limit failure, safe to surface as-is.
    if (resetError) {
      setError(resetError.message);
      return;
    }
    setIsSent(true);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-xl border border-border bg-surface p-8 shadow-sm">
        <div className="mb-6 text-center">
          <BrandLogo priority />
          <p className="mt-2 font-serif text-xl font-bold tracking-tight text-navy">NEWSROOM</p>
        </div>
        {isSent ? (
          <p className="text-center text-sm text-foreground/70">
            If an account exists for that email, we&apos;ve sent a password reset link.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <p className="text-sm text-foreground/60">
              Enter your email address and we&apos;ll send you a link to reset your password.
            </p>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="forgot-password-email">Email address</Label>
              <TextInput
                id="forgot-password-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            {error ? (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-400">
                {error}
              </p>
            ) : null}
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              className="justify-center"
            >
              {isSubmitting ? "Sending…" : "Send reset link"}
            </Button>
          </form>
        )}
        <p className="mt-6 text-center text-xs text-foreground/40">
          <Link href="/login" className="font-medium text-navy hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
