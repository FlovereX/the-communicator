import Link from "next/link";
import { redirect } from "next/navigation";
import { BrandLogo } from "@/components/shared/BrandLogo";
import { createClient } from "@/lib/supabase/server";
import { LoginForm } from "./LoginForm";

const CONFIRM_ERROR_MESSAGES: Record<string, string> = {
  confirmation_failed: "That verification link is invalid or has expired. Please try again.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string; error?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  const { redirectTo, error } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-xl border border-border bg-surface p-8 shadow-sm">
        <div className="mb-6 text-center">
          <BrandLogo priority />
          <p className="mt-2 font-serif text-xl font-bold tracking-tight text-navy">
            NEWSROOM
          </p>
        </div>
        {error ? (
          <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-400">
            {CONFIRM_ERROR_MESSAGES[error] ?? error}
          </p>
        ) : null}
        <LoginForm redirectTo={redirectTo || "/dashboard"} />
        <p className="mt-6 text-center text-xs text-foreground/40">
          Don&apos;t have access yet?{" "}
          <Link href="/join" className="font-medium text-navy hover:underline">
            Request access
          </Link>
        </p>
      </div>
    </div>
  );
}


