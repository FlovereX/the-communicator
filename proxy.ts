import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { PASSWORD_RECOVERY_COOKIE, PASSWORD_SETUP_COOKIE } from "@/lib/auth-cookies";
import { verifyPasswordSetupMarker } from "@/lib/password-setup-marker";

const PUBLIC_PATHS = ["/login", "/join", "/auth/confirm", "/forgot-password"];

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

/**
 * Runs before every matched request: refreshes the Supabase session cookie and
 * gates unauthenticated/pending/active access across the app.
 * Named `proxy` (not `middleware`) per this project's Next.js version — see
 * node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  if (!user) {
    if (!isPublicPath(pathname)) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(url);
    }
    return response;
  }

  // /auth/confirm performs its own verifyOtp + status-aware redirect; let it run
  // regardless of the caller's current status. /reset-password must stay reachable
  // for a valid recovery session too — password recovery is an auth operation, not
  // newsroom authorization, so it must not be gated by profile status. It additionally
  // requires the short-lived HttpOnly recovery marker cookie set by /auth/confirm, so a
  // merely-logged-in session (without a real recovery link) can't land there directly.
  if (pathname === "/auth/confirm") {
    return response;
  }

  if (pathname === "/reset-password") {
    const hasRecoveryMarker = Boolean(request.cookies.get(PASSWORD_RECOVERY_COOKIE)?.value);
    if (!hasRecoveryMarker) {
      const url = request.nextUrl.clone();
      url.pathname = "/forgot-password";
      url.search = "";
      return NextResponse.redirect(url);
    }
    return response;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("status, must_set_password")
    .eq("id", user.id)
    .single();
  const status = profile?.status ?? "pending";
  const mustSetPassword = profile?.must_set_password ?? false;

  // /set-password is reachable only via a fresh sign-in's signed marker — never a global
  // redirect. An invalid/missing marker or already-completed setup just falls through to
  // the normal active/pending destinations below, so ordinary sessions are never interrupted.
  if (pathname === "/set-password") {
    if (status !== "active") {
      const url = request.nextUrl.clone();
      url.pathname = "/pending";
      url.search = "";
      return NextResponse.redirect(url);
    }

    const markerToken = request.cookies.get(PASSWORD_SETUP_COOKIE)?.value;
    const markerIsValid =
      mustSetPassword && (await verifyPasswordSetupMarker(markerToken, user.id));
    if (!markerIsValid) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      url.search = "";
      return NextResponse.redirect(url);
    }
    return response;
  }

  if (status === "active") {
    if (pathname === "/login" || pathname === "/join" || pathname === "/pending") {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      url.search = "";
      return NextResponse.redirect(url);
    }
    return response;
  }

  // Pending/rejected/disabled: only /pending is reachable.
  if (pathname === "/pending") {
    return response;
  }

  const url = request.nextUrl.clone();
  url.pathname = "/pending";
  url.search = "";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};

