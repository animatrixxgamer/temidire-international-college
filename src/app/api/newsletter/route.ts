import { z } from "zod";
import { prisma } from "@/lib/db";
import { rateLimit, clientKey, tooManyRequests } from "@/lib/rateLimit";

const schema = z.object({ email: z.string().email().max(200) });

export async function POST(req: Request) {
  if (!rateLimit(clientKey(req, "newsletter"), 6, 60_000)) return tooManyRequests();
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Enter a valid email" }, { status: 400 });
  try {
    await prisma.newsletterSubscriber.upsert({
      where: { email: parsed.data.email.toLowerCase() },
      update: {},
      create: { email: parsed.data.email.toLowerCase() },
    });
    return Response.json({ ok: true });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Couldn't subscribe right now." }, { status: 500 });
  }
}
