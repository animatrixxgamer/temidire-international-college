import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { createSessionToken, sessionCookieOptions, SESSION_COOKIE, isStaff } from "@/lib/auth";
import { rateLimit, clientKey, tooManyRequests } from "@/lib/rateLimit";
import { audit } from "@/lib/audit";

const schema = z.object({ email: z.string().email(), password: z.string().min(1).max(200) });

export async function POST(req: Request) {
  if (!rateLimit(clientKey(req, "login"), 8, 60_000)) return tooManyRequests();
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Enter your email and password" }, { status: 400 });
  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  // Constant-ish response: don't reveal which part failed
  if (!user || !user.active) {
    return Response.json({ error: "Wrong email or password" }, { status: 401 });
  }
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    await audit("login.failed", { detail: email });
    return Response.json({ error: "Wrong email or password" }, { status: 401 });
  }

  const token = await createSessionToken({ id: user.id, email: user.email, name: user.name, role: user.role });
  const res = Response.json({
    ok: true,
    role: user.role,
    redirect: isStaff(user.role) ? "/admin" : "/portal",
  });
  res.headers.set(
    "Set-Cookie",
    serializeCookie(SESSION_COOKIE, token, sessionCookieOptions())
  );
  await audit("login.success", { detail: `${user.email} (${user.role})`, session: { id: user.id, email: user.email, name: user.name, role: user.role } });
  return res;
}

function serializeCookie(
  name: string,
  value: string,
  opts: { httpOnly: boolean; sameSite: string; path: string; maxAge: number; secure: boolean }
) {
  const parts = [`${name}=${value}`, `Path=${opts.path}`, `Max-Age=${opts.maxAge}`, `SameSite=Lax`];
  if (opts.httpOnly) parts.push("HttpOnly");
  if (opts.secure) parts.push("Secure");
  return parts.join("; ");
}
