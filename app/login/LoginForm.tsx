"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/shared/Button";
import { Label, TextInput } from "@/components/shared/FormControls";
import { createClient } from "@/lib/supabase/client";
import { getAuthConfirmUrl } from "@/lib/site-url";
import { login, type LoginState } from "./actions";

const INITIAL_STATE: LoginState = {};

export function LoginForm({ redirectTo }: { redirectTo: string }) {
  const [state, action, pending] = useActionState(login, INITIAL_STATE);
  const [magicEmail, setMagicEmail] = useState("");
  const [isSendingLink, setIsSendingLink] = useState(false);
  const [magicLinkError, setMagicLinkError] = useState<string | null>(null);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    if (!magicEmail.trim()) return;
    setIsSendingLink(true);
    setMagicLinkError(null);
    const supabase = createClient();
    // shouldCreateUser: false keeps this a login-only path — new accounts must go through /join.
    const { error } = await supabase.auth.signInWithOtp({
      email: magicEmail.trim(),
      options: {
        shouldCreateUser: false,
        emailRedirectTo: getAuthConfirmUrl(),
      },
    });
    setIsSendingLink(false);
    if (error) {
      setMagicLinkError(error.message);
      return;
    }
    setMagicLinkSent(true);
  }

  return (
    <div className="flex flex-col gap-6">
      <form action={action} className="flex flex-col gap-4">
        <input type="hidden" name="redirectTo" value={redirectTo} />
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="login-email">Email</Label>
          <TextInput
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="login-password">Password</Label>
          <TextInput
            id="login-password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </div>
        {state?.error ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {state.error}
          </p>
        ) : null}
        <Button type="submit" variant="primary" disabled={pending} className="mt-1 justify-center">
          {pending ? "Signing in…" : "Sign In"}
        </Button>
      </form>

      <div className="flex items-center gap-3 text-xs text-foreground/40">
        <span className="h-px flex-1 bg-border" />
        or
        <span className="h-px flex-1 bg-border" />
      </div>

      {magicLinkSent ? (
        <p className="text-center text-sm text-foreground/60">
          Check your email for a sign-in link.
        </p>
      ) : (
        <form onSubmit={handleMagicLink} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="magic-link-email">Email</Label>
            <TextInput
              id="magic-link-email"
              type="email"
              value={magicEmail}
              onChange={(e) => setMagicEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
          {magicLinkError ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {magicLinkError}
            </p>
          ) : null}
          <Button
            type="submit"
            variant="secondary"
            disabled={isSendingLink}
            className="justify-center"
          >
            {isSendingLink ? "Sending…" : "Email me a sign-in link"}
          </Button>
        </form>
      )}
    </div>
  );
}
