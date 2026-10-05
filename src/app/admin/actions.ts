"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { assertStaff, assertSuperAdmin } from "@/lib/guards";
import { audit } from "@/lib/audit";
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
}

export async function deletePhoto(formData: FormData) {
  const session = await assertStaff();
  const id = String(formData.get("id") || "");
  const photo = await prisma.photo.findUnique({ where: { id } });
  if (!photo) return;
  await prisma.photo.delete({ where: { id } });
  await audit("photo.delete", { entity: "Photo", entityId: id, detail: photo.src, session });
  revalidatePath("/admin/gallery");
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
