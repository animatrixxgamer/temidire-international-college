"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { assertStaff, assertSuperAdmin } from "@/lib/guards";
import { FINANCE_ROLES, STAFF_DIRECTORY_ROLES } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { gradeFor } from "@/lib/grading";
import { parseDay } from "@/lib/dates";
import bcrypt from "bcryptjs";
import { z } from "zod";

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

/* ————— Applications ————— */

const APP_STATUSES = ["NEW", "CONTACTED", "VISITING", "ASSESSMENT", "OFFERED", "ENROLLED", "REJECTED"] as const;

export async function setApplicationStatus(formData: FormData) {
  const session = await assertStaff();
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "");
  if (!id || !APP_STATUSES.includes(status as (typeof APP_STATUSES)[number])) return;
  const app = await prisma.admissionApplication.findUnique({ where: { id } });
  if (!app) return;
  await prisma.admissionApplication.update({ where: { id }, data: { status } });
  await audit("application.status", { entity: "AdmissionApplication", entityId: id, detail: `${app.reference}: ${app.status} → ${status}`, session });
  revalidatePath("/admin/applications");
  revalidatePath("/admin");
}

export async function addApplicationNote(formData: FormData) {
  const session = await assertStaff();
  const id = String(formData.get("id") || "");
  const note = String(formData.get("note") || "").slice(0, 2000);
  if (!id) return;
  await prisma.admissionApplication.update({ where: { id }, data: { adminNote: note } });
  await audit("application.note", { entity: "AdmissionApplication", entityId: id, session });
  revalidatePath("/admin/applications");
}

/* ————— News ————— */

const newsSchema = z.object({
  title: z.string().min(3).max(200),
  excerpt: z.string().min(3).max(500),
  body: z.string().min(3).max(20000),
});

export async function createNewsPost(formData: FormData) {
  const session = await assertStaff();
  const parsed = newsSchema.safeParse({
    title: formData.get("title"),
    excerpt: formData.get("excerpt"),
    body: formData.get("body"),
  });
  if (!parsed.success) return;
  let slug = slugify(parsed.data.title);
  const clash = await prisma.newsPost.findUnique({ where: { slug } });
  if (clash) slug = `${slug}-${Date.now().toString(36)}`;
  const post = await prisma.newsPost.create({ data: { ...parsed.data, slug } });
  await audit("news.create", { entity: "NewsPost", entityId: post.id, detail: parsed.data.title, session });
  revalidatePath("/admin/news");
  revalidatePath("/news");
  revalidatePath("/");
}

export async function toggleNewsPost(formData: FormData) {
  const session = await assertStaff();
  const id = String(formData.get("id") || "");
  const post = await prisma.newsPost.findUnique({ where: { id } });
  if (!post) return;
  await prisma.newsPost.update({ where: { id }, data: { published: !post.published } });
  await audit("news.toggle", { entity: "NewsPost", entityId: id, detail: `${post.title} → ${!post.published ? "published" : "hidden"}`, session });
  revalidatePath("/admin/news");
  revalidatePath("/news");
}

export async function deleteNewsPost(formData: FormData) {
  const session = await assertStaff();
  const id = String(formData.get("id") || "");
  const post = await prisma.newsPost.findUnique({ where: { id } });
  if (!post) return;
  await prisma.newsPost.delete({ where: { id } });
  await audit("news.delete", { entity: "NewsPost", entityId: id, detail: post.title, session });
  revalidatePath("/admin/news");
  revalidatePath("/news");
}

/* ————— Events ————— */

export async function createEvent(formData: FormData) {
  const session = await assertStaff();
  const title = String(formData.get("title") || "").trim();
  const date = String(formData.get("date") || "");
  const where = String(formData.get("where") || "").trim();
  if (title.length < 2 || !date) return;
  const ev = await prisma.event.create({ data: { title, date: new Date(date), where: where || null } });
  await audit("event.create", { entity: "Event", entityId: ev.id, detail: title, session });
  revalidatePath("/admin/events");
  revalidatePath("/news");
  revalidatePath("/");
}

export async function deleteEvent(formData: FormData) {
  const session = await assertStaff();
  const id = String(formData.get("id") || "");
  const ev = await prisma.event.findUnique({ where: { id } });
  if (!ev) return;
  await prisma.event.delete({ where: { id } });
  await audit("event.delete", { entity: "Event", entityId: id, detail: ev.title, session });
  revalidatePath("/admin/events");
  revalidatePath("/");
}

/* ————— Gallery ————— */

export async function createAlbum(formData: FormData) {
  const session = await assertStaff();
  const name = String(formData.get("name") || "").trim();
  if (name.length < 2) return;
  const slug = `${slugify(name)}-${Date.now().toString(36)}`;
  const album = await prisma.galleryAlbum.create({ data: { name, slug } });
  await audit("album.create", { entity: "GalleryAlbum", entityId: album.id, detail: name, session });
  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
}

export async function addPhoto(formData: FormData) {
  const session = await assertStaff();
  const albumId = String(formData.get("albumId") || "");
  const src = String(formData.get("src") || "").trim();
  const alt = String(formData.get("alt") || "").trim() || "School photo";
  if (!albumId || !src.startsWith("/")) return;
  const photo = await prisma.photo.create({ data: { albumId, src, alt } });
  await audit("photo.add", { entity: "Photo", entityId: photo.id, detail: src, session });
  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
}

export async function deletePhoto(formData: FormData) {
  const session = await assertStaff();
  const id = String(formData.get("id") || "");
  const photo = await prisma.photo.findUnique({ where: { id } });
  if (!photo) return;
  await prisma.photo.delete({ where: { id } });
  await audit("photo.delete", { entity: "Photo", entityId: id, detail: photo.src, session });
  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
}

/* ————— Attendance (Phase 2) ————— */

type SaveResult = { ok: boolean; error?: string; saved?: number };

const MARKS = ["PRESENT", "ABSENT", "LATE"] as const;

const attendanceSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  marks: z.record(z.string().min(1).max(64), z.enum(MARKS)),
});

/** Persist one school day's register. Called debounced from the register UI. */
export async function saveAttendance(input: {
  date: string;
  marks: Record<string, string>;
}): Promise<SaveResult> {
  const session = await assertStaff();
  const parsed = attendanceSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid attendance payload" };

  const entries = Object.entries(parsed.data.marks);
  if (!entries.length) return { ok: true, saved: 0 };

  // Only pupils that actually exist may be written.
  const roster = await prisma.studentProfile.findMany({
    where: { id: { in: entries.map(([id]) => id) } },
    select: { id: true },
  });
  const allowed = new Set(roster.map((s) => s.id));
  const date = parseDay(parsed.data.date);

  const ops = entries
    .filter(([studentId]) => allowed.has(studentId))
    .map(([studentId, status]) =>
      prisma.attendanceRecord.upsert({
        where: { studentId_date: { studentId, date } },
        update: { status, markedBy: session.id },
        create: { studentId, date, status, markedBy: session.id },
      }),
    );
  if (!ops.length) return { ok: true, saved: 0 };

  await prisma.$transaction(ops);
  await audit("attendance.save", {
    entity: "AttendanceRecord",
    detail: `${ops.length} marks on ${parsed.data.date}`,
    session,
  });
  revalidatePath("/admin/attendance");
  return { ok: true, saved: ops.length };
}

/* ————— Scores (Phase 2) ————— */

const scoresSchema = z.object({
  classroomId: z.string().min(1),
  subjectId: z.string().min(1),
  session: z.string().min(4).max(20),
  term: z.number().int().min(1).max(3),
  entries: z
    .array(
      z.object({
        studentId: z.string().min(1),
        ca: z.number().min(0).max(40),
        exam: z.number().min(0).max(60),
      }),
    )
    .max(60),
});

/** Persist CA/exam marks for one class + subject. Grades use the shared WAEC scale. */
export async function saveScores(input: {
  classroomId: string;
  subjectId: string;
  session: string;
  term: number;
  entries: Array<{ studentId: string; ca: number; exam: number }>;
}): Promise<SaveResult> {
  const session = await assertStaff();
  const parsed = scoresSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid score payload" };

  const { classroomId, subjectId, session: yr, term, entries } = parsed.data;
  if (!entries.length) return { ok: true, saved: 0 };

  const [classroom, subject, roster] = await Promise.all([
    prisma.classroom.findUnique({ where: { id: classroomId }, select: { id: true } }),
    prisma.subject.findUnique({ where: { id: subjectId }, select: { id: true } }),
    prisma.studentProfile.findMany({
      where: { classroomId, id: { in: entries.map((e) => e.studentId) } },
      select: { id: true },
    }),
  ]);
  if (!classroom || !subject) return { ok: false, error: "Unknown class or subject" };
  const allowed = new Set(roster.map((s) => s.id));

  const ops = entries
    .filter((e) => allowed.has(e.studentId))
    .map((e) => {
      const total = e.ca + e.exam;
      const grade = gradeFor(total).code;
      return prisma.score.upsert({
        where: {
          studentId_subjectId_session_term: {
            studentId: e.studentId,
            subjectId,
            session: yr,
            term,
          },
        },
        update: { ca: e.ca, exam: e.exam, total, grade, classroomId, enteredBy: session.id },
        create: {
          studentId: e.studentId,
          subjectId,
          classroomId,
          session: yr,
          term,
          ca: e.ca,
          exam: e.exam,
          total,
          grade,
          enteredBy: session.id,
        },
      });
    });
  if (!ops.length) return { ok: true, saved: 0 };

  await prisma.$transaction(ops);
  await audit("score.save", {
    entity: "Score",
    detail: `${ops.length} marks · ${classroom.id} · ${subjectId} · ${yr} T${term}`,
    session,
  });
  revalidatePath("/admin/scores");
  return { ok: true, saved: ops.length };
}

/* ————— Inbox ————— */

export async function markMessageHandled(formData: FormData) {
  const session = await assertStaff();
  const id = String(formData.get("id") || "");
  const msg = await prisma.contactMessage.findUnique({ where: { id } });
  if (!msg) return;
  await prisma.contactMessage.update({ where: { id }, data: { handled: !msg.handled } });
  await audit("message.toggle", { entity: "ContactMessage", entityId: id, session });
  revalidatePath("/admin/inbox");
  revalidatePath("/admin");
}

/* ————— Users (SUPER_ADMIN) ————— */

const userSchema = z.object({
  name: z.string().min(3).max(120),
  email: z.string().email(),
  role: z.enum(["ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL", "BURSAR", "CLASS_TEACHER", "TEACHER"]),
  password: z.string().min(8).max(100),
});

export async function createStaffUser(formData: FormData) {
  const session = await assertSuperAdmin();
  const parsed = userSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    role: formData.get("role"),
    password: formData.get("password"),
  });
  if (!parsed.success) return;
  const { name, email, role, password } = parsed.data;
  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) return;
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({ data: { name, email: email.toLowerCase(), role, passwordHash } });
  await prisma.staffProfile.create({
    data: { userId: user.id, staffNo: `TMD/STF/${Date.now().toString(36).toUpperCase().slice(-5)}` },
  });
  await audit("user.create", { entity: "User", entityId: user.id, detail: `${email} as ${role}`, session });
  revalidatePath("/admin/users");
}

export async function toggleUserActive(formData: FormData) {
  const session = await assertSuperAdmin();
  const id = String(formData.get("id") || "");
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user || user.role === "SUPER_ADMIN") return; // can't disable yourself
  await prisma.user.update({ where: { id }, data: { active: !user.active } });
  await audit("user.toggleActive", { entity: "User", entityId: id, detail: `${user.email} → ${!user.active ? "active" : "disabled"}`, session });
  revalidatePath("/admin/users");
}

export async function changeUserRole(formData: FormData) {
  const session = await assertSuperAdmin();
  const id = String(formData.get("id") || "");
  const role = String(formData.get("role") || "");
  const allowed = ["ADMINISTRATOR", "PRINCIPAL", "VICE_PRINCIPAL", "BURSAR", "CLASS_TEACHER", "TEACHER", "STUDENT", "PARENT"];
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user || user.role === "SUPER_ADMIN" || !allowed.includes(role)) return;
  await prisma.user.update({ where: { id }, data: { role } });
  await audit("user.changeRole", { entity: "User", entityId: id, detail: `${user.email}: ${user.role} → ${role}`, session });
  revalidatePath("/admin/users");
}

export async function resetUserPassword(formData: FormData) {
  const session = await assertSuperAdmin();
  const id = String(formData.get("id") || "");
  const password = String(formData.get("password") || "");
  if (password.length < 8) return;
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return;
  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.update({ where: { id }, data: { passwordHash } });
  await audit("user.resetPassword", { entity: "User", entityId: id, detail: user.email, session });
  revalidatePath("/admin/users");
}

/* ————— Settings (SUPER_ADMIN) ————— */

export async function setSetting(formData: FormData) {
  const session = await assertSuperAdmin();
  const key = String(formData.get("key") || "").trim();
  const value = String(formData.get("value") || "").trim();
  if (!key) return;
  await prisma.settings.upsert({ where: { key }, update: { value }, create: { key, value } });
  await audit("settings.set", { entity: "Settings", entityId: key, detail: `${key} = ${value.slice(0, 80)}`, session });
  revalidatePath("/admin/settings");
}

/* ————— Report cards (Phase 2) ————— */

const remarksSchema = z.object({
  studentId: z.string().min(1),
  session: z.string().min(4).max(20),
  term: z.number().int().min(1).max(3),
  teacherRemark: z.string().max(1000).optional(),
  principalRemark: z.string().max(1000).optional(),
});

/** Save the class-teacher and principal comments on one pupil's term result. */
export async function saveResultRemarks(formData: FormData) {
  const session = await assertStaff();
  const parsed = remarksSchema.safeParse({
    studentId: formData.get("studentId"),
    session: formData.get("session"),
    term: Number(formData.get("term")),
    teacherRemark: String(formData.get("teacherRemark") || "").slice(0, 1000),
    principalRemark: String(formData.get("principalRemark") || "").slice(0, 1000),
  });
  if (!parsed.success) return;
  const { studentId, session: yr, term, teacherRemark, principalRemark } = parsed.data;

  const student = await prisma.studentProfile.findUnique({
    where: { id: studentId },
    select: { id: true, classroomId: true },
  });
  if (!student || !student.classroomId) return;

  await prisma.resultSheet.upsert({
    where: { studentId_session_term: { studentId, session: yr, term } },
    update: { teacherRemark, principalRemark },
    create: {
      studentId,
      session: yr,
      term,
      classroomId: student.classroomId,
      teacherRemark,
      principalRemark,
    },
  });
  await audit("result.remarks", {
    entity: "ResultSheet",
    entityId: studentId,
    detail: `${yr} T${term}`,
    session,
  });
  revalidatePath(`/admin/reports/${studentId}`);
}

const publishSchema = z.object({
  studentId: z.string().min(1),
  session: z.string().min(4).max(20),
  term: z.number().int().min(1).max(3),
  publish: z.enum(["0", "1"]),
});

/** Publish (or withdraw) one pupil's result so the portal can show it. */
export async function setResultPublished(formData: FormData) {
  const session = await assertStaff();
  const parsed = publishSchema.safeParse({
    studentId: formData.get("studentId"),
    session: formData.get("session"),
    term: Number(formData.get("term")),
    publish: String(formData.get("publish") || "0"),
  });
  if (!parsed.success) return;
  const { studentId, session: yr, term } = parsed.data;
  const publish = parsed.data.publish === "1";

  const student = await prisma.studentProfile.findUnique({
    where: { id: studentId },
    select: { classroomId: true },
  });
  if (!student?.classroomId) return;

  await prisma.resultSheet.upsert({
    where: { studentId_session_term: { studentId, session: yr, term } },
    update: {
      published: publish,
      publishedAt: publish ? new Date() : null,
      publishedBy: publish ? session.id : null,
    },
    create: {
      studentId,
      session: yr,
      term,
      classroomId: student.classroomId,
      published: publish,
      publishedAt: publish ? new Date() : null,
      publishedBy: publish ? session.id : null,
    },
  });
  await audit(publish ? "result.publish" : "result.unpublish", {
    entity: "ResultSheet",
    entityId: studentId,
    detail: `${yr} T${term}`,
    session,
  });
  revalidatePath(`/admin/reports/${studentId}`);
  revalidatePath("/admin/reports");
  revalidatePath("/portal");
}

/* ————— Timetable (Phase 2) ————— */

const timetableSchema = z.object({
  classroomId: z.string().min(1),
  slots: z
    .array(
      z.object({
        day: z.number().int().min(1).max(5),
        period: z.number().int().min(1).max(8),
        subjectId: z.string().min(1),
      }),
    )
    .max(40),
});

/**
 * Replace a class's whole week in one save. "No stored slot" means free period,
 * so an empty cell must clear any slot that was there before — hence delete-then-create.
 */
export async function saveTimetable(input: {
  classroomId: string;
  slots: Array<{ day: number; period: number; subjectId: string }>;
}): Promise<SaveResult> {
  const session = await assertStaff();
  const parsed = timetableSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid timetable payload" };
  const { classroomId, slots } = parsed.data;

  const classroom = await prisma.classroom.findUnique({
    where: { id: classroomId },
    select: { id: true, arm: true },
  });
  if (!classroom) return { ok: false, error: "Unknown class" };

  // Only subjects belonging to this class's arm may be placed on its timetable.
  const subjects = slots.length
    ? await prisma.subject.findMany({
        where: { id: { in: slots.map((s) => s.subjectId) } },
        select: { id: true, arm: true },
      })
    : [];
  const allowed = new Set(subjects.filter((s) => s.arm === classroom.arm).map((s) => s.id));
  const keep = slots.filter((s) => allowed.has(s.subjectId));

  await prisma.$transaction([
    prisma.timetableSlot.deleteMany({ where: { classroomId } }),
    ...keep.map((s) =>
      prisma.timetableSlot.create({
        data: { classroomId, day: s.day, period: s.period, subjectId: s.subjectId },
      }),
    ),
  ]);
  await audit("timetable.save", {
    entity: "TimetableSlot",
    detail: `${keep.length} periods · ${classroom.id}`,
    session,
  });
  revalidatePath("/admin/timetable");
  revalidatePath("/portal");
  return { ok: true, saved: keep.length };
}

/* ————— Announcements ————— */

const announcementSchema = z.object({
  title: z.string().min(3).max(200),
  body: z.string().min(3).max(5000),
  audience: z.enum(["ALL", "STUDENTS", "PARENTS", "STAFF"]),
});

export async function createAnnouncement(formData: FormData) {
  const session = await assertStaff();
  const parsed = announcementSchema.safeParse({
    title: formData.get("title"),
    body: formData.get("body"),
    audience: formData.get("audience"),
  });
  if (!parsed.success) return;
  const row = await prisma.announcement.create({ data: parsed.data });
  await audit("announcement.create", {
    entity: "Announcement",
    entityId: row.id,
    detail: `${parsed.data.audience}: ${parsed.data.title}`,
    session,
  });
  revalidatePath("/admin/announcements");
  revalidatePath("/portal");
}

export async function deleteAnnouncement(formData: FormData) {
  const session = await assertStaff();
  const id = String(formData.get("id") || "");
  const row = await prisma.announcement.findUnique({ where: { id } });
  if (!row) return;
  await prisma.announcement.delete({ where: { id } });
  await audit("announcement.delete", {
    entity: "Announcement",
    entityId: id,
    detail: row.title,
    session,
  });
  revalidatePath("/admin/announcements");
  revalidatePath("/portal");
}

/* ————— Staff directory ————— */

const staffSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(3).max(120),
  title: z.string().max(20).optional(),
  roleTitle: z.string().max(120).optional(),
  phone: z.string().max(30).optional(),
  bio: z.string().max(1500).optional(),
});

/** Edit the public-facing details of a staff member's profile. */
export async function updateStaff(formData: FormData) {
  const session = await assertStaff();
  if (!STAFF_DIRECTORY_ROLES.includes(session.role)) throw new Error("Not authorised");
  const parsed = staffSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
    title: String(formData.get("title") || "") || undefined,
    roleTitle: String(formData.get("roleTitle") || "") || undefined,
    phone: String(formData.get("phone") || "") || undefined,
    bio: String(formData.get("bio") || "") || undefined,
  });
  if (!parsed.success) return;
  const { id, name, title, roleTitle, phone, bio } = parsed.data;
  const profile = await prisma.staffProfile.findUnique({
    where: { id },
    select: { userId: true },
  });
  if (!profile) return;
  await prisma.$transaction([
    prisma.user.update({ where: { id: profile.userId }, data: { name } }),
    prisma.staffProfile.update({ where: { id }, data: { title, roleTitle, phone, bio } }),
  ]);
  await audit("staff.update", { entity: "StaffProfile", entityId: id, detail: name, session });
  revalidatePath("/admin/staff");
  revalidatePath("/about/leadership");
}

/* ————— Students ————— */

const studentSchema = z.object({
  name: z.string().min(3).max(120),
  email: z.string().email(),
  admissionNo: z.string().min(3).max(40),
  classroomId: z.string().optional(),
  password: z.string().min(8).max(100),
});

/** Enrol a pupil: creates the STUDENT login and its profile in one go. */
export async function createStudent(formData: FormData) {
  const session = await assertStaff();
  const parsed = studentSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    admissionNo: formData.get("admissionNo"),
    classroomId: String(formData.get("classroomId") || "") || undefined,
    password: formData.get("password"),
  });
  if (!parsed.success) return;
  const { name, email, admissionNo, classroomId, password } = parsed.data;
  const [emailClash, numberClash] = await Promise.all([
    prisma.user.findUnique({ where: { email: email.toLowerCase() } }),
    prisma.studentProfile.findUnique({ where: { admissionNo } }),
  ]);
  if (emailClash || numberClash) return;
  if (classroomId) {
    const room = await prisma.classroom.findUnique({ where: { id: classroomId }, select: { id: true } });
    if (!room) return;
  }
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { name, email: email.toLowerCase(), role: "STUDENT", passwordHash },
  });
  const profile = await prisma.studentProfile.create({
    data: { userId: user.id, admissionNo, classroomId: classroomId ?? null },
  });
  await audit("student.create", {
    entity: "StudentProfile",
    entityId: profile.id,
    detail: `${name} · ${admissionNo}`,
    session,
  });
  revalidatePath("/admin/students");
  revalidatePath("/admin");
}

export async function updateStudentClass(formData: FormData) {
  const session = await assertStaff();
  const id = String(formData.get("id") || "");
  const classroomId = String(formData.get("classroomId") || "");
  if (!id) return;
  if (classroomId) {
    const room = await prisma.classroom.findUnique({ where: { id: classroomId }, select: { id: true } });
    if (!room) return;
  }
  const student = await prisma.studentProfile.findUnique({
    where: { id },
    select: { user: { select: { name: true } } },
  });
  if (!student) return;
  await prisma.studentProfile.update({
    where: { id },
    data: { classroomId: classroomId || null },
  });
  await audit("student.class", {
    entity: "StudentProfile",
    entityId: id,
    detail: `${student.user.name} moved class`,
    session,
  });
  revalidatePath("/admin/students");
  revalidatePath("/portal");
}

export async function toggleStudentActive(formData: FormData) {
  const session = await assertStaff();
  const id = String(formData.get("id") || "");
  const student = await prisma.studentProfile.findUnique({ where: { id } });
  if (!student) return;
  await prisma.studentProfile.update({ where: { id }, data: { active: !student.active } });
  await audit("student.toggleActive", {
    entity: "StudentProfile",
    entityId: id,
    detail: student.admissionNo,
    session,
  });
  revalidatePath("/admin/students");
}

/* ————— Assignments ————— */

const assignmentSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(3).max(8000),
  classroomId: z.string().min(1),
  subjectId: z.string().optional(),
  dueDate: z.string().optional(),
});

export async function createAssignment(formData: FormData) {
  const session = await assertStaff();
  const parsed = assignmentSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    classroomId: formData.get("classroomId"),
    subjectId: String(formData.get("subjectId") || "") || undefined,
    dueDate: String(formData.get("dueDate") || "") || undefined,
  });
  if (!parsed.success) return;
  const { title, description, classroomId, subjectId, dueDate } = parsed.data;
  const classroom = await prisma.classroom.findUnique({ where: { id: classroomId }, select: { id: true } });
  if (!classroom) return;
  if (subjectId) {
    const subject = await prisma.subject.findUnique({ where: { id: subjectId }, select: { id: true } });
    if (!subject) return;
  }
  const row = await prisma.assignment.create({
    data: {
      title,
      description,
      classroomId,
      subjectId: subjectId ?? null,
      postedBy: session.id,
      dueDate: dueDate ? new Date(dueDate) : null,
    },
  });
  await audit("assignment.create", {
    entity: "Assignment",
    entityId: row.id,
    detail: title,
    session,
  });
  revalidatePath("/admin/assignments");
  revalidatePath("/portal");
}

export async function deleteAssignment(formData: FormData) {
  const session = await assertStaff();
  const id = String(formData.get("id") || "");
  const row = await prisma.assignment.findUnique({ where: { id } });
  if (!row) return;
  // Submissions reference the assignment, so clear them first.
  await prisma.$transaction([
    prisma.submission.deleteMany({ where: { assignmentId: id } }),
    prisma.assignment.delete({ where: { id } }),
  ]);
  await audit("assignment.delete", { entity: "Assignment", entityId: id, detail: row.title, session });
  revalidatePath("/admin/assignments");
  revalidatePath("/portal");
}

/* ————— Fees ————— */

const invoiceSchema = z.object({
  studentId: z.string().min(1),
  kind: z.enum(["TUITION", "LEVIES", "TRANSPORT"]),
  amount: z.coerce.number().min(1).max(10_000_000),
});

/** Bill one pupil for the current session/term. Duplicate bills are ignored. */
export async function createInvoice(formData: FormData) {
  const session = await assertStaff();
  if (!FINANCE_ROLES.includes(session.role)) throw new Error("Not authorised");
  const parsed = invoiceSchema.safeParse({
    studentId: formData.get("studentId"),
    kind: formData.get("kind"),
    amount: formData.get("amount"),
  });
  if (!parsed.success) return;
  const { studentId, kind, amount } = parsed.data;
  const [student, sessionRow, termRow] = await Promise.all([
    prisma.studentProfile.findUnique({ where: { id: studentId }, select: { id: true } }),
    prisma.settings.findUnique({ where: { key: "current_session" } }),
    prisma.settings.findUnique({ where: { key: "current_term" } }),
  ]);
  if (!student) return;
  const yr = sessionRow?.value ?? "2026/2027";
  const term = Number(termRow?.value ?? "1") || 1;
  const existing = await prisma.feeInvoice.findUnique({
    where: { studentId_session_term_kind: { studentId, session: yr, term, kind } },
  });
  if (existing) return;
  const invoice = await prisma.feeInvoice.create({
    data: { studentId, session: yr, term, kind, amount },
  });
  await audit("invoice.create", {
    entity: "FeeInvoice",
    entityId: invoice.id,
    detail: `${kind} ₦${amount} · ${yr} T${term}`,
    session,
  });
  revalidatePath("/admin/fees");
  revalidatePath("/portal");
}

const paymentSchema = z.object({
  invoiceId: z.string().min(1),
  amount: z.coerce.number().min(1).max(10_000_000),
  method: z.enum(["MANUAL", "PAYSTACK"]),
  reference: z.string().max(120).optional(),
});

/** Record money received against an invoice and keep its status in step. */
export async function recordPayment(formData: FormData) {
  const session = await assertStaff();
  if (!FINANCE_ROLES.includes(session.role)) throw new Error("Not authorised");
  const parsed = paymentSchema.safeParse({
    invoiceId: formData.get("invoiceId"),
    amount: formData.get("amount"),
    method: formData.get("method"),
    reference: String(formData.get("reference") || "") || undefined,
  });
  if (!parsed.success) return;
  const { invoiceId, amount, method, reference } = parsed.data;
  const invoice = await prisma.feeInvoice.findUnique({ where: { id: invoiceId } });
  if (!invoice) return;
  const paid = invoice.paidAmount + amount;
  const status = paid >= invoice.amount ? "PAID" : paid > 0 ? "PART" : "PENDING";
  await prisma.$transaction([
    prisma.payment.create({
      data: {
        invoiceId,
        amount,
        method,
        reference: reference ?? null,
        status: "SUCCESS",
        recordedBy: session.id,
      },
    }),
    prisma.feeInvoice.update({ where: { id: invoiceId }, data: { paidAmount: paid, status } }),
  ]);
  await audit("payment.record", {
    entity: "FeeInvoice",
    entityId: invoiceId,
    detail: `₦${amount} · ${method} · ${status}`,
    session,
  });
  revalidatePath("/admin/fees");
  revalidatePath("/portal");
}
