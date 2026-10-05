import "server-only";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-server";
import { isStaff } from "@/lib/auth";
import type { SessionUser } from "@/lib/auth";

/** Require any signed-in staff user (or super admin) for an admin page. */
export async function requireStaff(): Promise<SessionUser> {
  const session = await getSession();
  if (!session || !isStaff(session.role) || session.role === "STUDENT" || session.role === "PARENT") {
    redirect("/login?next=/admin");
  }
  return session;
}

/** Require super admin specifically. */
export async function requireSuperAdmin(): Promise<SessionUser> {
  const session = await requireStaff();
  if (session.role !== "SUPER_ADMIN") redirect("/admin");
  return session;
}

/** Role check for server actions — throws instead of redirecting. */
export async function assertStaff(): Promise<SessionUser> {
  const session = await getSession();
  if (!session || !isStaff(session.role)) throw new Error("Not authorised");
  return session;
}

export async function assertSuperAdmin(): Promise<SessionUser> {
  const session = await assertStaff();
  if (session.role !== "SUPER_ADMIN") throw new Error("Super admin only");
  return session;
}
