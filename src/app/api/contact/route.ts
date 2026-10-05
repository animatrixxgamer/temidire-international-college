import { z } from "zod";
import { prisma } from "@/lib/db";
import { rateLimit, clientKey, tooManyRequests } from "@/lib/rateLimit";

const schema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().max(30).optional().or(z.literal("")),
  subject: z.string().min(2).max(120),
  message: z.string().min(10).max(4000),
});

export async function POST(req: Request) {
  if (!rateLimit(clientKey(req, "contact"), 5, 60_000)) return tooManyRequests();
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message || "Please check the form" }, { status: 400 });
  }
  const d = parsed.data;
  try {
    await prisma.contactMessage.create({
      data: {
        name: d.name,
        email: d.email || null,
        phone: d.phone || null,
        subject: d.subject,
        message: d.message,
      },
    });
    return Response.json({ ok: true });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Couldn't send right now — please try again." }, { status: 500 });
  }
}
