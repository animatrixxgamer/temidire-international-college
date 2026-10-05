import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "temidire_session";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: string;
};

function secret() {
  const s = process.env.AUTH_SECRET || "temidire-dev-secret-change-me";
  return new TextEncoder().encode(s);
}

export async function createSessionToken(u: SessionUser) {
  return new SignJWT({ name: u.name, email: u.email, role: u.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(u.id)
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret());
}

/** Verify only the token — works in Edge middleware (no DB access). */
export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, secret());
    if (!payload.sub) return null;
    return {
      id: payload.sub,
      name: (payload.name as string) ?? "",
      email: (payload.email as string) ?? "",
      role: (payload.role as string) ?? "",
    };
  } catch {
    return null;
  }
}

export const sessionCookieOptions = () => ({
  httpOnly: true as const,
  sameSite: "lax" as const,
  path: "/",
  maxAge: MAX_AGE,
  secure: process.env.NODE_ENV === "production",
});

/** Roles allowed to reach the admin area (SUPER_ADMIN is checked separately). */
export const STAFF_ROLES = [
  "SUPER_ADMIN",
  "ADMINISTRATOR",
  "PRINCIPAL",
  "VICE_PRINCIPAL",
  "BURSAR",
  "CLASS_TEACHER",
  "TEACHER",
];

export const isStaff = (role: string) => STAFF_ROLES.includes(role);
