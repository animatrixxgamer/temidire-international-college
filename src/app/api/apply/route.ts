import { z } from "zod";
import { prisma } from "@/lib/db";
import { rateLimit, clientKey, tooManyRequests } from "@/lib/rateLimit";
import { audit } from "@/lib/audit";

const schema = z.object({
  childName: z.string().min(3).max(120),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  gender: z.enum(["Female", "Male"]),
  level: z.enum(["CRECHE", "NURSERY", "PRIMARY", "SECONDARY"]),
  previousSchool: z.string().max(200).optional().or(z.literal("")),
  guardianName: z.string().min(3).max(120),
  relationship: z.string().min(2).max(40),
  phone: z.string().regex(/^0[7-9][01]\d{8}$/, "Enter a phone number like 0803 123 4567"),
  whatsapp: z.string().regex(/^0[7-9][01]\d{8}$/).optional().or(z.literal("")),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().min(5).max(300),
  notes: z.string().max(2000).optional().or(z.literal("")),
  heardVia: z.string().max(80).optional().or(z.literal("")),
  consent: z.literal(true),
});

function makeRef() {
  const n = Math.floor(100 + Math.random() * 900);
  return `TMD-2026-${String(Date.now()).slice(-5)}${n}`.slice(0, 17);
}

export async function POST(req: Request) {
  if (!rateLimit(clientKey(req, "apply"), 5, 60_000)) return tooManyRequests();
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return Response.json({ error: first?.message || "Please check the form" }, { status: 400 });
  }
  const d = parsed.data;
  try {
    const app = await prisma.admissionApplication.create({
      data: {
        reference: makeRef(),
        childName: d.childName,
        dateOfBirth: d.dateOfBirth,
        gender: d.gender,
        level: d.level,
        previousSchool: d.previousSchool || null,
        guardianName: d.guardianName,
        relationship: d.relationship,
        phone: d.phone,
        whatsapp: d.whatsapp || null,
        email: d.email || null,
        address: d.address,
        notes: d.notes || null,
        heardVia: d.heardVia || null,
        consent: true,
      },
    });
    await audit("application.submitted", { entity: "AdmissionApplication", entityId: app.id, detail: `${d.childName} (${d.level})` });
    return Response.json({ ok: true, reference: app.reference });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "We couldn't save your application right now — please try again." }, { status: 500 });
  }
}
