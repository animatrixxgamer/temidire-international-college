import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { requireStaff } from "@/lib/guards";
import { createStudent, updateStudentClass, toggleStudentActive } from "@/app/admin/actions";
import { EmptyState } from "@/components/motion/EmptyStates";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Students" };

function ClassOptions({
  classrooms,
  emptyLabel = "Unassigned",
}: {
  classrooms: Array<{ id: string; name: string }>;
  emptyLabel?: string;
}) {
  return (
    <>
      <option value="">{emptyLabel}</option>
      {classrooms.map((c) => (
        <option key={c.id} value={c.id}>
          {c.name}
        </option>
      ))}
    </>
  );
}

export default async function AdminStudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; class?: string }>;
}) {
  await requireStaff();
  const { q, class: classParam } = await searchParams;
  const query = (q ?? "").trim();

  const classrooms = await prisma.classroom.findMany({
    orderBy: [{ arm: "asc" }, { order: "asc" }],
  });

  const students = await prisma.studentProfile.findMany({
    where: {
      ...(classParam ? { classroomId: classParam } : {}),
      ...(query
        ? {
            OR: [
              { user: { name: { contains: query } } },
              { admissionNo: { contains: query } },
            ],
          }
        : {}),
    },
    include: {
      user: { select: { name: true, email: true } },
      classroom: { select: { id: true, name: true } },
      parents: {
        include: {
          parent: { include: { user: { select: { name: true } } } },
        },
      },
      _count: { select: { scores: true, attendance: true } },
    },
    orderBy: { admissionNo: "asc" },
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-3xl">Students</h1>
        <p className="mt-1 text-ivory-100/60">
          Every pupil on roll. Enrol a new child, move them between classes, or
          take a pupil off the active roll.
        </p>
      </header>

      <form
        action={createStudent}
        className="grid gap-3 rounded-2xl border border-gold-500/25 bg-navy-800/60 p-6 md:grid-cols-3"
      >
        <h2 className="font-serif text-xl md:col-span-3">Enrol a pupil</h2>
        <input
          name="name"
          required
          placeholder="Full name"
          className="rounded-md border border-ivory-100/20 bg-navy-950 px-3 py-2.5"
        />
        <input
          name="email"
          type="email"
          required
          placeholder="pupil@student.temidirecollege.ng"
          className="rounded-md border border-ivory-100/20 bg-navy-950 px-3 py-2.5"
        />
        <input
          name="admissionNo"
          required
          placeholder="Admission no. (TMD/2026/0007)"
          className="rounded-md border border-ivory-100/20 bg-navy-950 px-3 py-2.5"
        />
        <label className="text-sm text-ivory-100/70">
          Class
          <select
            name="classroomId"
            className="mt-1 block w-full rounded-md border border-ivory-100/20 bg-navy-950 px-3 py-2 text-sm"
          >
            <ClassOptions classrooms={classrooms} />
          </select>
        </label>
        <input
          name="password"
          type="password"
          required
          minLength={8}
          placeholder="Temporary password (8+)"
          className="rounded-md border border-ivory-100/20 bg-navy-950 px-3 py-2.5"
        />
        <button className="rounded-full bg-gold-500 px-6 py-2.5 font-semibold text-navy-950 md:self-end">
          Enrol pupil
        </button>
      </form>

      <form method="get" className="flex flex-wrap items-end gap-3 rounded-2xl border border-ivory-100/10 bg-navy-800/60 p-4">
        <label className="text-sm text-ivory-100/70">
          Search
          <input
            name="q"
            defaultValue={query}
            placeholder="Name or admission number"
            className="mt-1 block w-64 rounded-md border border-ivory-100/20 bg-navy-950 px-3 py-2 text-sm"
          />
        </label>
        <label className="text-sm text-ivory-100/70">
          Class
          <select
            name="class"
            defaultValue={classParam ?? ""}
            className="mt-1 block w-56 rounded-md border border-ivory-100/20 bg-navy-950 px-3 py-2 text-sm"
          >
            <ClassOptions classrooms={classrooms} emptyLabel="All classes" />
          </select>
        </label>
        <button className="rounded-full bg-gold-500 px-5 py-2 text-sm font-semibold text-navy-950">
          Filter
        </button>
        <p className="ml-auto text-sm text-ivory-100/50">
          {students.length} pupil{students.length === 1 ? "" : "s"}
        </p>
      </form>

      <div className="space-y-3">
        {students.map((s) => {
          const guardians = s.parents
            .map((p) => `${p.parent.user.name} (${p.relationship})`)
            .join(", ");
          return (
            <details key={s.id} className="rounded-2xl border border-ivory-100/10 bg-navy-800/60 p-5">
              <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">
                    {s.user.name}
                    <span className="ml-2 text-xs font-normal text-ivory-100/50">{s.admissionNo}</span>
                    {!s.active && (
                      <span className="ml-2 rounded-full bg-ember-500/20 px-2 py-0.5 text-[10px] text-ember-500">
                        INACTIVE
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-ivory-100/60">
                    {s.classroom?.name ?? "Unassigned"} · {s.user.email}
                  </p>
                </div>
                <span className="rounded-full bg-ivory-100/10 px-3 py-1 text-xs">
                  {s._count.scores} scores · {s._count.attendance} marks
                </span>
              </summary>
              <div className="mt-4 grid gap-3 text-sm md:grid-cols-2">
                <p className="text-ivory-100/60">
                  <span className="text-ivory-100/40">Guardian:</span> {guardians || "Not linked yet"}
                </p>
                <form action={updateStudentClass} className="flex gap-2">
                  <input type="hidden" name="id" value={s.id} />
                  <select
                    name="classroomId"
                    defaultValue={s.classroom?.id ?? ""}
                    className="w-full rounded-md border border-ivory-100/20 bg-navy-950 px-3 py-2 text-sm"
                  >
                    <ClassOptions classrooms={classrooms} />
                  </select>
                  <button className="rounded-md bg-gold-500 px-3 py-2 text-sm font-semibold text-navy-950">
                    Move
                  </button>
                </form>
                <form action={toggleStudentActive}>
                  <input type="hidden" name="id" value={s.id} />
                  <button
                    className={`rounded-md border px-3 py-2 text-sm ${
                      s.active
                        ? "border-ember-500/50 text-ember-500"
                        : "border-emerald-600/50 text-emerald-600"
                    }`}
                  >
                    {s.active ? "Take off roll" : "Return to roll"}
                  </button>
                </form>
              </div>
            </details>
          );
        })}
        {students.length === 0 && (
          <EmptyState
            kind="book"
            tone="dark"
            className="rounded-2xl border border-ivory-100/10 bg-navy-800/60 py-8"
            caption={query || classParam ? "No pupils match that filter." : "No pupils enrolled yet."}
          />
        )}
      </div>
    </div>
  );
}
