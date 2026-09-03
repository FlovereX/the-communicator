import { redirect } from "next/navigation";
import { Button } from "@/components/shared/Button";
import { BrandLogo } from "@/components/shared/BrandLogo";
import { signOut } from "@/lib/supabase/actions";
import { createClient } from "@/lib/supabase/server";

const STATUS_COPY: Record<string, { title: string; message: string }> = {
  pending: {
    title: "Your access request is pending approval.",
    message: "A newsroom admin will review your request soon.",
  },
  rejected: {
    title: "Your access request was not approved.",
    message: "Contact a newsroom admin if you think this is a mistake.",
  },
  disabled: {
    title: "Your newsroom account has been disabled.",
    message: "Contact a newsroom admin for more information.",
  },
};

export default async function PendingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profile?.status === "active") {
    redirect("/dashboard");
  }

  const copy = STATUS_COPY[profile?.status ?? "pending"] ?? STATUS_COPY.pending;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-surface p-8 text-center shadow-sm">
        <div className="mb-6">
          <BrandLogo priority />
          <p className="mt-2 font-serif text-xl font-bold tracking-tight text-navy">
            NEWSROOM
          </p>
        </div>
        <p className="font-serif text-lg font-semibold text-foreground">{copy.title}</p>
        <p className="mt-2 text-sm text-foreground/60">{copy.message}</p>
        <div className="mt-6 rounded-lg border border-border bg-background/60 p-4 text-left text-sm">
          <p className="font-medium text-foreground">{profile?.full_name}</p>
          <p className="text-foreground/60">{profile?.email}</p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-foreground/40">
            Status: {profile?.status ?? "pending"}
          </p>
        </div>
        <form action={signOut} className="mt-6">
          <Button type="submit" variant="secondary" className="w-full justify-center">
            Sign Out
          </Button>
        </form>
      </div>
    </div>
  );
}
