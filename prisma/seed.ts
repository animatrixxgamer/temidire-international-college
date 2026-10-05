/**
 * Seed: super admin + demo staff/classrooms/subjects/routes/content.
 * Safe to re-run (upserts by unique keys).
 * Run: npm run db:seed
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SUPER_ADMIN_EMAIL || "admin@temidirecollege.ng";
  const password = process.env.SUPER_ADMIN_PASSWORD || "TemidireAdmin2026!";

  const hash = await bcrypt.hash(password, 12);

  // ——— Super admin ———
  await prisma.user.upsert({
    where: { email },
    update: { passwordHash: hash, role: "SUPER_ADMIN", active: true },
    create: {
      email,
      passwordHash: hash,
      name: "School Owner",
      role: "SUPER_ADMIN",
    },
  });

  // ——— Demo management team ———
  const demoStaff: Array<{ name: string; email: string; role: string; roleTitle: string }> = [
    { name: "Mrs. Olufunmilayo Akinwale", email: "principal@temidirecollege.ng", role: "PRINCIPAL", roleTitle: "Principal" },
    { name: "Mrs. Bukola Oyelade", email: "schooladmin@temidirecollege.ng", role: "ADMINISTRATOR", roleTitle: "School Administrator" },
    { name: "Mr. Adebayo Fasanya", email: "vp@temidirecollege.ng", role: "VICE_PRINCIPAL", roleTitle: "Vice Principal (Academics)" },
    { name: "Mr. Segun Adewale", email: "bursar@temidirecollege.ng", role: "BURSAR", roleTitle: "Bursar" },
  ];

  let staffNo = 1;
  for (const s of demoStaff) {
    const u = await prisma.user.upsert({
      where: { email: s.email },
      update: { role: s.role, active: true },
      create: {
        email: s.email,
        passwordHash: hash,
        name: s.name,
        role: s.role,
      },
    });
    const existingProfile = await prisma.staffProfile.findUnique({ where: { userId: u.id } });
    if (!existingProfile) {
      await prisma.staffProfile.create({
        data: {
          userId: u.id,
          staffNo: "TMD/STF/" + String(staffNo).padStart(3, "0"),
          roleTitle: s.roleTitle,
        },
      });
    }
    staffNo++;
  }

  // ——— Classrooms (Creche → SSS 3) ———
  const arms = [
    { arm: "CRECHE", names: ["Creche"] },
    { arm: "NURSERY", names: ["Nursery 1", "Nursery 2"] },
    { arm: "PRIMARY", names: ["Primary 1", "Primary 2", "Primary 3", "Primary 4", "Primary 5", "Primary 6"] },
    { arm: "SECONDARY", names: ["JSS 1 A", "JSS 2 A", "JSS 3 A", "SSS 1 Science", "SSS 2 Science", "SSS 3 Science"] },
  ];
  for (const a of arms) {
    for (let i = 0; i < a.names.length; i++) {
      const existing = await prisma.classroom.findFirst({ where: { name: a.names[i] } });
      if (!existing) {
        await prisma.classroom.create({
          data: { arm: a.arm, name: a.names[i], order: i + 1 },
        });
      }
    }
  }

  // ——— Subjects ———
  const subjects: Array<[string, string, string, string | null]> = [
    ["MTH", "Mathematics", "SECONDARY", "CORE"],
    ["ENG", "English Language", "SECONDARY", "CORE"],
    ["PHY", "Physics", "SECONDARY", "SCIENCE"],
    ["CHM", "Chemistry", "SECONDARY", "SCIENCE"],
    ["BIO", "Biology", "SECONDARY", "SCIENCE"],
    ["ECO", "Economics", "SECONDARY", "COMMERCIAL"],
    ["GOV", "Government", "SECONDARY", "ARTS"],
    ["LIT", "Literature", "SECONDARY", "ARTS"],
    ["BST", "Basic Science", "PRIMARY", "CORE"],
    ["NUM", "Numeracy", "NURSERY", null],
    ["PLAY", "Play & Routine", "CRECHE", null],
  ];
  for (const [code, name, arm, track] of subjects) {
    await prisma.subject.upsert({
      where: { code },
      update: { name, arm, track },
      create: { code, name, arm, track },
    });
  }

  // ——— Bus routes ———
  const routes: Array<[string, string[], string, number]> = [
    ["Yaba – Odojomu", ["Yaba Junction", "Odojomu Market", "Ondo Poly Gate", "School"], "6:45am", 32000],
    ["Fagun – Sabo", ["Fagun Roundabout", "Sabo Park", "Lagos Garage", "School"], "6:50am", 30000],
    ["Akure Road", ["Akure Road Junction", "Bolorunduro", "Town Hall", "School"], "6:40am", 34000],
    ["Ife Road", ["Ife Road Filling Station", "Oke-Odo", "Market Square", "School"], "6:55am", 30000],
  ];
  for (const [name, stops, pickup, termFee] of routes) {
    const existing = await prisma.busRoute.findFirst({ where: { name } });
    if (!existing) {
      await prisma.busRoute.create({ data: { name, stops: JSON.stringify(stops), pickup, termFee } });
    }
  }

  // ——— Fee structures (2026/2027) ———
  const feeRows: Array<[string, string, number]> = [
    ["CRECHE", "TUITION", 75000],
    ["CRECHE", "LEVIES", 12000],
    ["NURSERY", "TUITION", 85000],
    ["NURSERY", "LEVIES", 14000],
    ["PRIMARY", "TUITION", 105000],
    ["PRIMARY", "LEVIES", 18000],
    ["SECONDARY", "TUITION", 145000],
    ["SECONDARY", "LEVIES", 25000],
  ];
  for (const [arm, kind, amount] of feeRows) {
    const existing = await prisma.feeStructure.findFirst({
      where: { session: "2026/2027", arm, kind },
    });
    if (!existing) {
      await prisma.feeStructure.create({ data: { session: "2026/2027", arm, kind, amount } });
    }
  }

  // ——— CMS content ———
  const news = [
    { title: "Admissions open for the 2026/2027 session", excerpt: "Places are available from Creche to SSS 1. Book a visit this month." },
    { title: "Our JSS 3 team wins the zonal quiz", excerpt: "Five pupils beat 14 schools in Ondo to take the trophy home." },
    { title: "New science laboratory opens", excerpt: "Every SSS class now has weekly practical sessions in the new lab." },
    { title: "Inter-house sports day: results and photos", excerpt: "Gold House takes the cup after a close finish in the relay." },
  ];
  for (const n of news) {
    const slug = n.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const existing = await prisma.newsPost.findUnique({ where: { slug } });
    if (!existing) {
      await prisma.newsPost.create({
        data: { title: n.title, slug, excerpt: n.excerpt, body: n.excerpt },
      });
    }
  }

  const events: Array<[string, string, string | null]> = [
    ["2026-10-17", "Open day", "Main campus"],
    ["2026-10-31", "Mid-term break begins", null],
    ["2026-11-14", "Entrance assessment", "Main hall"],
  ];
  for (const [date, title, where] of events) {
    const existing = await prisma.event.findFirst({ where: { title, date: new Date(date) } });
    if (!existing) {
      await prisma.event.create({ data: { title, date: new Date(date), where } });
    }
  }

  await prisma.settings.upsert({
    where: { key: "current_session" },
    update: { value: "2026/2027" },
    create: { key: "current_session", value: "2026/2027" },
  });
  await prisma.settings.upsert({
    where: { key: "current_term" },
    update: { value: "1" },
    create: { key: "current_term", value: "1" },
  });

  console.log("✅ Seed complete. Super admin:", email);
  console.log("   Demo logins use the same password as SUPER_ADMIN_PASSWORD.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
