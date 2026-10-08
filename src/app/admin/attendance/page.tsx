import type { Metadata } from "next";
import { requireStaff } from "@/lib/guards";
import { prisma } from "@/lib/db";
import { isDayKey, parseDay, todayKey } from "@/lib/dates";
import AttendancePanel from "@/components/dashboard/AttendancePanel";
import type { AttendanceMark } from "@/components/dashboard/Attendance";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Attendance" };

const MARKS = ["PRESENT", "ABSENT", "LATE"];

export default async function AdminAttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ class?: string; date?: string }>;
}) {
  await requireStaff();
  const { class: classParam, date: dateParam } = await searchParams;
  const date = isDayKey(dateParam) ? dateParam : todayKey();

  const classrooms = await prisma.classroom.findMany({
    orderBy: [{ arm: "asc" }, { order: "asc" }],
  });
  const classroom =
    classrooms.find((c) => c.id === classParam) ??
    classrooms.find((c) => c.name === "JSS 1 A") ??
    classrooms[0];

  const students = classroom
    ? await prisma.studentProfile.findMany({
        where: { classroomId: classroom.id, active: true },
        include: { user: { select: { name: true } } },
      })
    : [];
  students.sort((a, b) => a.user.name.localeCompare(b.user.name));

  const roster = students.map((s) => ({ id: s.id, name: s.user.name }));

  const records = students.length
    ? await prisma.attendanceRecord.findMany({
        where: { date: parseDay(date), studentId: { in: students.map((s) => s.id) } },
      })
    : [];
  const initialMarks = Object.fromEntries(
    records
      .filter((r) => MARKS.includes(r.status))
      .map((r) => [r.studentId, r.status as AttendanceMark]),
  );

  const prettyDate = new Date(`${date}T12:00:00`).toLocaleDateString("en-NG", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-3xl">Attendance</h1>
        <p className="mt-1 text-ivory-100/60">
          {classroom ? `${classroom.arm} · ${classroom.name}` : "No classes yet"} · {prettyDate}
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
          Day
          <input
            type="date"
            name="date"
            defaultValue={date}
            className="mt-1 block rounded-md border border-ivory-100/20 bg-navy-950 px-3 py-2 text-sm"
          />
        </label>
        <button className="rounded-full bg-gold-500 px-5 py-2 text-sm font-semibold text-navy-950">
          Load register
        </button>
      </form>

      {roster.length ? (
        <AttendancePanel date={date} students={roster} initialMarks={initialMarks} />
      ) : (
        <p className="rounded-2xl border border-ivory-100/10 bg-navy-800/60 p-8 text-center text-ivory-100/50">
          No pupils in this class yet — enrol students first.
        </p>
      )}

      <p className="max-w-3xl text-xs text-ivory-100/40">
        Marks are written to the attendance table (one row per pupil per day) and
        show up on the pupil's record and portal.
      </p>
    </div>
  );
}
