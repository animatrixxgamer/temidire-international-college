import type { Metadata } from "next";
import { requireStaff } from "@/lib/guards";
import { prisma } from "@/lib/db";
import ScorePanel from "@/components/dashboard/ScorePanel";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Scores" };

export default async function AdminScoresPage({
  searchParams,
}: {
  searchParams: Promise<{ class?: string; subject?: string }>;
}) {
  await requireStaff();
  const { class: classParam, subject: subjectParam } = await searchParams;

  const [classrooms, subjects, sessionRow, termRow] = await Promise.all([
    prisma.classroom.findMany({ orderBy: [{ arm: "asc" }, { order: "asc" }] }),
    prisma.subject.findMany({ orderBy: { name: "asc" } }),
    prisma.settings.findUnique({ where: { key: "current_session" } }),
    prisma.settings.findUnique({ where: { key: "current_term" } }),
  ]);

  const classroom =
    classrooms.find((c) => c.id === classParam) ??
    classrooms.find((c) => c.name === "JSS 1 A") ??
    classrooms[0];

  const armSubjects = subjects.filter((s) => s.arm === classroom?.arm);
  const pool = armSubjects.length ? armSubjects : subjects;
  const subject = pool.find((s) => s.id === subjectParam || s.code === subjectParam) ?? pool[0];

  const session = sessionRow?.value ?? "2026/2027";
  const term = Number(termRow?.value ?? "1") || 1;

  const students = classroom
    ? await prisma.studentProfile.findMany({
        where: { classroomId: classroom.id, active: true },
        include: { user: { select: { name: true } } },
      })
    : [];
  students.sort((a, b) => a.user.name.localeCompare(b.user.name));
  const roster = students.map((s) => ({ id: s.id, name: s.user.name }));

  const saved =
    classroom && subject && students.length
      ? await prisma.score.findMany({
          where: {
            classroomId: classroom.id,
            subjectId: subject.id,
            session,
            term,
            studentId: { in: students.map((s) => s.id) },
          },
        })
      : [];
  const initial = Object.fromEntries(
    saved.map((s) => [s.studentId, { ca: s.ca, exam: s.exam }]),
  );

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-3xl">Scores</h1>
        <p className="mt-1 text-ivory-100/60">
          {classroom ? `${classroom.arm} · ${classroom.name}` : "No classes yet"} ·{" "}
          {subject?.name ?? "no subject"} · CA out of 40 + exam out of 60, graded on
          the WAEC scale (A1–F9) as you type. Press Enter to jump to the next pupil.
        </p>
      </header>

      <form method="get" className="flex flex-wrap items-end gap-3 rounded-2xl border border-ivory-100/10 bg-navy-800/60 p-4">
        <label className="text-sm text-ivory-100/70">
          Class
          <select
            name="class"
            defaultValue={classroom?.id}
            className="mt-1 block w-56 rounded-md border border-ivory-100/20 bg-navy-950 px-3 py-2 text-sm"
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
            name="subject"
            defaultValue={subject?.id}
            className="mt-1 block w-56 rounded-md border border-ivory-100/20 bg-navy-950 px-3 py-2 text-sm"
          >
            {pool.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code} · {s.name}
              </option>
            ))}
          </select>
        </label>
        <button className="rounded-full bg-gold-500 px-5 py-2 text-sm font-semibold text-navy-950">
          Load sheet
        </button>
      </form>

      {roster.length && subject && classroom ? (
        <ScorePanel
          classroomId={classroom.id}
          subjectId={subject.id}
          session={session}
          term={term}
          students={roster}
          initial={initial}
        />
      ) : (
        <p className="rounded-2xl border border-ivory-100/10 bg-navy-800/60 p-8 text-center text-ivory-100/50">
          {!roster.length
            ? "No pupils in this class yet — enrol students first."
            : "No subjects for this class arm."}
        </p>
      )}

      <p className="max-w-3xl text-xs text-ivory-100/40">
        One row per pupil per subject per term in the results table; report cards
        read from the same rows.
      </p>
    </div>
  );
}
