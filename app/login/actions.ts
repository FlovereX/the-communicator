"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { PASSWORD_SETUP_COOKIE, PASSWORD_SETUP_COOKIE_MAX_AGE_SECONDS } from "@/lib/auth-cookies";
import { createPasswordSetupMarker } from "@/lib/password-setup-marker";
import { createClient } from "@/lib/supabase/server";

export interface LoginState {
  error?: string;
}

export async function login(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const redirectTo = String(formData.get("redirectTo") ?? "") || "/dashboard";

  if (!email || !password) {
    return { error: "Enter your email and password." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "Invalid email or password." };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("status, must_set_password")
      .eq("id", user.id)
      .single();

    // Non-active statuses are left to proxy.ts's existing per-request gate — unchanged.
    if (profile?.status === "active" && profile.must_set_password) {
      const cookieStore = await cookies();
      cookieStore.set(PASSWORD_SETUP_COOKIE, await createPasswordSetupMarker(user.id), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: PASSWORD_SETUP_COOKIE_MAX_AGE_SECONDS,
      });
      redirect("/set-password");
    }
  }

  redirect(redirectTo);
}
