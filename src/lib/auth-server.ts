import { cookies } from "next/headers";
import { verifySessionToken, SESSION_COOKIE, type SessionUser } from "@/lib/auth";

/** Read the session inside server components / route handlers. */
export async function getSession(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}
