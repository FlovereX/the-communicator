import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  PASSWORD_RECOVERY_COOKIE,
  PASSWORD_RECOVERY_COOKIE_MAX_AGE_SECONDS,
  PASSWORD_SETUP_COOKIE,
  PASSWORD_SETUP_COOKIE_MAX_AGE_SECONDS,
} from "@/lib/auth-cookies";
import { createPasswordSetupMarker } from "@/lib/password-setup-marker";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  if (tokenHash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });

    if (!error) {
      // Password recovery establishes a session but must not be routed through the
      // newsroom profile-status check below — it's an auth operation, not newsroom access.
      // It also never sets the password-setup marker — recovery and setup stay separate.
      if (type === "recovery") {
        const response = NextResponse.redirect(`${origin}/reset-password`);
        response.cookies.set(PASSWORD_RECOVERY_COOKIE, "1", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: PASSWORD_RECOVERY_COOKIE_MAX_AGE_SECONDS,
        });
        return response;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      let status: string | null = null;
      let mustSetPassword = false;
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("status, must_set_password")
          .eq("id", user.id)
          .single();
        status = profile?.status ?? null;
        mustSetPassword = profile?.must_set_password ?? false;
      }

      if (user && status === "active" && mustSetPassword) {
        const response = NextResponse.redirect(`${origin}/set-password`);
        response.cookies.set(PASSWORD_SETUP_COOKIE, await createPasswordSetupMarker(user.id), {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: PASSWORD_SETUP_COOKIE_MAX_AGE_SECONDS,
        });
        return response;
      }

      const destination = status === "active" ? "/dashboard" : "/pending";
      return NextResponse.redirect(`${origin}${destination}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=confirmation_failed`);
}
