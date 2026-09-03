import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LoginForm } from "./LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  const { redirectTo } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-xl border border-border bg-surface p-8 shadow-sm">
        <div className="mb-6 text-center">
          <p className="text-[11px] font-semibold tracking-[0.22em] text-navy/70">
            THE COMMUNICATOR
          </p>
          <p className="mt-0.5 font-serif text-xl font-bold tracking-tight text-navy">
            NEWSROOM
          </p>
        </div>
        <LoginForm redirectTo={redirectTo || "/dashboard"} />
      </div>
    </div>
  );
}
