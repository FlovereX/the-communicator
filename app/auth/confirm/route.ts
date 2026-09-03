import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { PASSWORD_RECOVERY_COOKIE, PASSWORD_RECOVERY_COOKIE_MAX_AGE_SECONDS } from "@/lib/auth-cookies";

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
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("status")
          .eq("id", user.id)
          .single();
        status = profile?.status ?? null;
      }

      const destination = status === "active" ? "/dashboard" : "/pending";
      return NextResponse.redirect(`${origin}${destination}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=confirmation_failed`);
}
