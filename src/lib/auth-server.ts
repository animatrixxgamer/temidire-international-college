import { cookies } from "next/headers";
import { verifySessionToken, SESSION_COOKIE, type SessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

/**
 * Read the session inside server components / route handlers.
 *
 * Tokens last a week, so re-check the account on every use: a disabled user must
 * lose access immediately, and role changes take effect without waiting for the
 * token to expire.
 */
export async function getSession(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = await verifySessionToken(token);
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: { name: true, email: true, role: true, active: true },
  });
  if (!user?.active) return null;

  return { id: session.id, name: user.name, email: user.email, role: user.role };
}
