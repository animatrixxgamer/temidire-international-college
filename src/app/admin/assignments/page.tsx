import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { requireStaff } from "@/lib/guards";
import { createAssignment, deleteAssignment } from "@/app/admin/actions";
import { EmptyState } from "@/components/motion/EmptyStates";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Assignments" };

const fmt = (d: Date | null) =>
  d ? d.toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" }) : "No due date";

export default async function AdminAssignmentsPage() {
  await requireStaff();

  const [classrooms, subjects, assignments] = await Promise.all([
    prisma.classroom.findMany({ orderBy: [{ arm: "asc" }, { order: "asc" }] }),
    prisma.subject.findMany({ orderBy: { name: "asc" } }),
    prisma.assignment.findMany({
      include: {
        classroom: { select: { name: true } },
        subject: { select: { name: true } },
        _count: { select: { submissions: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);

  const now = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-3xl">Assignments</h1>
        <p className="mt-1 text-ivory-100/60">
          Homework published to a class appears on every pupil&apos;s portal with its
          due date.
        </p>
      </header>

      <form action={createAssignment} className="grid gap-3 rounded-2xl border border-gold-500/25 bg-navy-800/60 p-6 md:grid-cols-2">
        <h2 className="font-serif text-xl md:col-span-2">Set an assignment</h2>
        <input
          name="title"
          required
          placeholder="Title (e.g. Read chapter 4 and answer questions 1–8)"
          className="rounded-md border border-ivory-100/20 bg-navy-950 px-3 py-2.5 md:col-span-2"
        />
        <textarea
          name="description"
          required
          rows={4}
          placeholder="What the pupils should do, and how it will be marked…"
          className="rounded-md border border-ivory-100/20 bg-navy-950 px-3 py-2.5 md:col-span-2"
        />
        <label className="text-sm text-ivory-100/70">
          Class
          <select
            name="classroomId"
            required
            className="mt-1 block w-full rounded-md border border-ivory-100/20 bg-navy-950 px-3 py-2 text-sm"
          >
            {classrooms.map((c) => (
              <option key={c.id} value={c.id}>
                {c.arm} · {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm text-ivory-100/70">
          Subject
          <select
            name="subjectId"
            className="mt-1 block w-full rounded-md border border-ivory-100/20 bg-navy-950 px-3 py-2 text-sm"
          >
            <option value="">General</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code} · {s.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm text-ivory-100/70">
          Due date
          <input
            name="dueDate"
            type="date"
            min={now}
            className="mt-1 block w-full rounded-md border border-ivory-100/20 bg-navy-950 px-3 py-2 text-sm"
          />
        </label>
        <button className="rounded-full bg-gold-500 px-6 py-2.5 font-semibold text-navy-950 md:self-end md:justify-self-start">
          Publish assignment
        </button>
      </form>

      <div className="space-y-3">
        {assignments.map((a) => (
          <div key={a.id} className="rounded-2xl border border-ivory-100/10 bg-navy-800/60 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold">{a.title}</p>
                <p className="mt-1 text-sm text-ivory-100/70">{a.description}</p>
                <p className="mt-2 text-xs text-ivory-100/50">
                  {a.classroom.name}
                  {a.subject ? ` · ${a.subject.name}` : " · General"} · due {fmt(a.dueDate)} ·{" "}
                  {a._count.submissions} submission{a._count.submissions === 1 ? "" : "s"}
                </p>
              </div>
              <form action={deleteAssignment} className="shrink-0">
                <input type="hidden" name="id" value={a.id} />
                <button className="rounded-md border border-ember-500/40 px-3 py-1.5 text-sm text-ember-500">
                  Remove
                </button>
              </form>
            </div>
          </div>
        ))}
        {assignments.length === 0 && (
          <EmptyState
            kind="book"
            tone="dark"
            className="rounded-2xl border border-ivory-100/10 bg-navy-800/60 py-8"
            caption="No assignments yet — set the first one above."
          />
        )}
      </div>
    </div>
  );
}
