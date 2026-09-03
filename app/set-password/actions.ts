"use server";

import { cookies } from "next/headers";
import { PASSWORD_SETUP_COOKIE } from "@/lib/auth-cookies";

/** Clears the HttpOnly password-setup marker set by a fresh sign-in — can only be done server-side. */
export async function clearPasswordSetupMarker() {
  const cookieStore = await cookies();
  cookieStore.delete(PASSWORD_SETUP_COOKIE);
}
