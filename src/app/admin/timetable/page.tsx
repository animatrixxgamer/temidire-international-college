import type { Metadata } from "next";
import { requireStaff } from "@/lib/guards";
import { prisma } from "@/lib/db";
import TimetableEditor from "@/components/dashboard/TimetableEditor";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Timetable" };

export default async function AdminTimetablePage({
  searchParams,
}: {
  searchParams: Promise<{ class?: string }>;
}) {
  await requireStaff();
  const { class: classParam } = await searchParams;

  const classrooms = await prisma.classroom.findMany({
    orderBy: [{ arm: "asc" }, { order: "asc" }],
  });
  const classroom =
    classrooms.find((c) => c.id === classParam) ??
    classrooms.find((c) => c.name === "JSS 1 A") ??
    classrooms[0];

  const allSubjects = await prisma.subject.findMany({ orderBy: { name: "asc" } });
  const subjects = allSubjects.filter((s) => s.arm === classroom?.arm);

  const slots = classroom
    ? await prisma.timetableSlot.findMany({ where: { classroomId: classroom.id } })
    : [];

  const initial: Record<string, string> = {};
  for (const s of slots) {
    if (s.subjectId) initial[`${s.day}-${s.period}`] = s.subjectId;
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-3xl">Timetable</h1>
        <p className="mt-1 text-ivory-100/60">
          {classroom ? `${classroom.arm} · ${classroom.name}` : "No classes yet"} ·{" "}
          {Object.keys(initial).length} of 40 periods placed
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
        <button className="rounded-full bg-gold-500 px-5 py-2 text-sm font-semibold text-navy-950">
          Load week
        </button>
      </form>

      {subjects.length && classroom ? (
        <TimetableEditor classroomId={classroom.id} subjects={subjects} initial={initial} />
      ) : (
        <p className="rounded-2xl border border-ivory-100/10 bg-navy-800/60 p-8 text-center text-ivory-100/50">
          {classroom
            ? "No subjects exist for this class arm yet."
            : "No classes yet."}
        </p>
      )}

      <p className="max-w-3xl text-xs text-ivory-100/40">
        Lessons run on the standard bell (Period 1 at 08:00). Breaks are added
        automatically, and the same week appears on every pupil's portal for the
        classes they belong to.
      </p>
    </div>
  );
}
