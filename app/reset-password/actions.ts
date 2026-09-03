"use server";

import { cookies } from "next/headers";
import { PASSWORD_RECOVERY_COOKIE } from "@/lib/auth-cookies";

/** Clears the HttpOnly recovery marker set by /auth/confirm — can only be done server-side. */
export async function clearRecoveryMarker() {
  const cookieStore = await cookies();
  cookieStore.delete(PASSWORD_RECOVERY_COOKIE);
}
