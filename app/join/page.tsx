import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { JoinForm } from "./JoinForm";

export default async function JoinPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("status")
      .eq("id", user.id)
      .single();
    if (profile?.status === "active") {
      redirect("/dashboard");
    }
  }

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
          <p className="mt-3 text-sm text-foreground/60">Request newsroom access</p>
        </div>
        <JoinForm />
      </div>
    </div>
  );
}
