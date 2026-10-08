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

  // Term windows — report-card attendance only counts marks inside these dates.
  const termDates: Array<[string, string]> = [
    ["term_1_start", "2026-09-01"],
    ["term_1_end", "2026-12-18"],
    ["term_2_start", "2027-01-05"],
    ["term_2_end", "2027-03-27"],
    ["term_3_start", "2027-04-20"],
    ["term_3_end", "2027-07-10"],
  ];
  for (const [key, value] of termDates) {
    await prisma.settings.upsert({ where: { key }, update: { value }, create: { key, value } });
  }

  // ——— Demo pupils (JSS 1 A) so scores, report cards and the portal have data ———
  const jss1 = await prisma.classroom.findFirst({ where: { name: "JSS 1 A" } });
  const demoSession = "2026/2027";
  const demoTerm = 1;
  let publishedPupilId: string | null = null;

  if (jss1) {
    // Local WAEC scale so the seed does not depend on app path aliases.
    const bands: Array<[number, string]> = [
      [75, "A1"], [70, "B2"], [65, "B3"], [60, "C4"], [55, "C5"],
      [50, "C6"], [45, "D7"], [40, "E8"], [0, "F9"],
    ];
    const gradeOf = (total: number) => (bands.find(([min]) => total >= min) ?? bands[8])[1];

    const pupils = [
      { name: "Adaeze Nwosu", admissionNo: "TMD/2026/0001", base: 74 },
      { name: "Emeka Obi", admissionNo: "TMD/2026/0002", base: 68 },
      { name: "Fatima Bello", admissionNo: "TMD/2026/0003", base: 81 },
      { name: "Tunde Adeyemi", admissionNo: "TMD/2026/0004", base: 59 },
      { name: "Ngozi Eze", admissionNo: "TMD/2026/0005", base: 72 },
      { name: "Samuel Ojo", admissionNo: "TMD/2026/0006", base: 46 },
    ];
    const subjects = await prisma.subject.findMany({
      where: { code: { in: ["MTH", "ENG", "PHY", "CHM", "BIO"] } },
      orderBy: { code: "asc" },
    });

    let pupilNo = 0;
    for (const p of pupils) {
      const studentEmail =
        p.name.toLowerCase().replace(/[^a-z]+/g, ".") + "@student.temidirecollege.ng";
      const user = await prisma.user.upsert({
        where: { email: studentEmail },
        update: { name: p.name, role: "STUDENT", active: true },
        create: { email: studentEmail, passwordHash: hash, name: p.name, role: "STUDENT" },
      });
      const profile = await prisma.studentProfile.upsert({
        where: { admissionNo: p.admissionNo },
        update: { userId: user.id, classroomId: jss1.id },
        create: { userId: user.id, admissionNo: p.admissionNo, classroomId: jss1.id },
      });

      for (let i = 0; i < subjects.length; i++) {
        const subject = subjects[i];
        const total = Math.max(20, Math.min(98, p.base + ((i * 7) % 15) - 5));
        const ca = Math.round(total * 0.4 * 10) / 10;
        const exam = Math.round((total - ca) * 10) / 10;
        await prisma.score.upsert({
          where: {
            studentId_subjectId_session_term: {
              studentId: profile.id,
              subjectId: subject.id,
              session: demoSession,
              term: demoTerm,
            },
          },
          update: { ca, exam, total, grade: gradeOf(total), classroomId: jss1.id, enteredBy: "seed" },
          create: {
            studentId: profile.id,
            subjectId: subject.id,
            classroomId: jss1.id,
            session: demoSession,
            term: demoTerm,
            ca,
            exam,
            total,
            grade: gradeOf(total),
            enteredBy: "seed",
          },
        });
      }

      // A short attendance history, mostly present.
      for (let d = 1; d <= 4; d++) {
        const day = new Date(Date.UTC(2026, 9, 12 - d, 9, 0, 0));
        const status =
          (pupilNo + d) % 7 === 0 ? "ABSENT" : (pupilNo + d) % 5 === 0 ? "LATE" : "PRESENT";
        await prisma.attendanceRecord.upsert({
          where: { studentId_date: { studentId: profile.id, date: day } },
          update: { status, markedBy: "seed" },
          create: { studentId: profile.id, date: day, status, markedBy: "seed" },
        });
      }

      if (!publishedPupilId) publishedPupilId = profile.id;
      pupilNo++;
    }

    // ——— Demo timetable for JSS 1 A (day 1–5, lesson period 1–8) ———
    const vp = await prisma.staffProfile.findFirst({
      where: { roleTitle: { contains: "Vice Principal (Academics)" } },
    });
    const byCode = new Map(subjects.map((s) => [s.code, s.id]));
    const demoWeek: Array<[number, number, string]> = [
      [1, 1, "MTH"], [1, 2, "ENG"], [1, 3, "BIO"], [1, 4, "CHM"], [1, 5, "PHY"],
      [2, 1, "ENG"], [2, 2, "MTH"], [2, 3, "PHY"], [2, 4, "BIO"],
      [3, 1, "MTH"], [3, 2, "CHM"], [3, 3, "ENG"],
      [4, 1, "BIO"], [4, 2, "MTH"], [4, 3, "ENG"], [4, 4, "PHY"],
      [5, 1, "MTH"], [5, 2, "ENG"], [5, 3, "CHM"],
    ];
    for (const [day, period, code] of demoWeek) {
      const subjectId = byCode.get(code);
      if (!subjectId) continue;
      await prisma.timetableSlot.upsert({
        where: { classroomId_day_period: { classroomId: jss1.id, day, period } },
        update: { subjectId, teacherId: vp?.id ?? null },
        create: { classroomId: jss1.id, day, period, subjectId, teacherId: vp?.id ?? null },
      });
    }

    // One parent login, linked to the first pupil.
    const parentEmail = "parent@temidirecollege.ng";
    const parentUser = await prisma.user.upsert({
      where: { email: parentEmail },
      update: { role: "PARENT", active: true },
      create: {
        email: parentEmail,
        passwordHash: hash,
        name: "Mrs. Chioma Nwosu",
        role: "PARENT",
      },
    });
    const parentProfile = await prisma.parentProfile.upsert({
      where: { userId: parentUser.id },
      update: {},
      create: { userId: parentUser.id, phone: "+234 803 555 0199" },
    });

    if (publishedPupilId) {
      await prisma.studentParent.upsert({
        where: {
          studentId_parentId: { studentId: publishedPupilId, parentId: parentProfile.id },
        },
        update: { isPrimary: true },
        create: {
          studentId: publishedPupilId,
          parentId: parentProfile.id,
          relationship: "mother",
          isPrimary: true,
        },
      });

      // Publish one pupil's result so the portal shows a real report card.
      await prisma.resultSheet.upsert({
        where: {
          studentId_session_term: {
            studentId: publishedPupilId,
            session: demoSession,
            term: demoTerm,
          },
        },
        update: { published: true, publishedAt: new Date() },
        create: {
          studentId: publishedPupilId,
          classroomId: jss1.id,
          session: demoSession,
          term: demoTerm,
          published: true,
          publishedAt: new Date(),
          teacherRemark: "A strong, steady term — keep reading widely.",
          principalRemark: "Well done. We look forward to an even better Term 2.",
        },
      });
    }
  }

  console.log("✅ Seed complete. Super admin:", email);
  console.log("   Demo logins use the same password as SUPER_ADMIN_PASSWORD.");
  console.log("   Demo pupil: adaeze.nwosu@student.temidirecollege.ng · parent: parent@temidirecollege.ng");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
