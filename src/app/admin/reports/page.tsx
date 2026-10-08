import type { Metadata } from "next";
import Link from "next/link";
import { requireStaff } from "@/lib/guards";
import { prisma } from "@/lib/db";
import { buildClassReport, ordinal, type ScoreRow } from "@/lib/report";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Report cards" };

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ class?: string; session?: string; term?: string }>;
}) {
  await requireStaff();
  const params = await searchParams;

  const [classrooms, sessionRow, termRow] = await Promise.all([
    prisma.classroom.findMany({ orderBy: [{ arm: "asc" }, { order: "asc" }] }),
    prisma.settings.findUnique({ where: { key: "current_session" } }),
    prisma.settings.findUnique({ where: { key: "current_term" } }),
  ]);

  const session = params.session || sessionRow?.value || "2026/2027";
  const term = Math.min(3, Math.max(1, Number(params.term || termRow?.value || "1") || 1));

  const classroom =
    classrooms.find((c) => c.id === params.class) ??
    classrooms.find((c) => c.name === "JSS 1 A") ??
    classrooms[0];

  const students = classroom
    ? await prisma.studentProfile.findMany({
        where: { classroomId: classroom.id, active: true },
        include: { user: { select: { name: true } } },
      })
    : [];

  const [scores, sheets] = await Promise.all([
    classroom
      ? prisma.score.findMany({
          where: { classroomId: classroom.id, session, term },
          include: { subject: { select: { code: true, name: true } } },
        })
      : Promise.resolve([]),
    classroom
      ? prisma.resultSheet.findMany({
          where: { classroomId: classroom.id, session, term },
          select: { studentId: true, published: true },
        })
      : Promise.resolve([]),
  ]);

  const byStudent = new Map<string, ScoreRow[]>();
  for (const s of scores) {
    const list = byStudent.get(s.studentId) ?? [];
    list.push({
      subjectId: s.subjectId,
      code: s.subject.code,
      name: s.subject.name,
      ca: s.ca,
      exam: s.exam,
      total: s.total,
      grade: s.grade,
    });
    byStudent.set(s.studentId, list);
  }
  const publishedSet = new Set(sheets.filter((s) => s.published).map((s) => s.studentId));

  const report = buildClassReport(
    students.map((s) => ({
      studentId: s.id,
      name: s.user.name,
      subjects: byStudent.get(s.id) ?? [],
    })),
  );

  const withMarks = report.filter((r) => r.subjectCount > 0).length;
  const classAverage = withMarks
    ? Math.round((report.reduce((sum, r) => sum + r.average, 0) / withMarks) * 10) / 10
    : 0;

  const link = (next: Record<string, string>) => {
    const q = new URLSearchParams({
      class: classroom?.id ?? "",
      session,
      term: String(term),
      ...next,
    });
    return `/admin/reports?${q.toString()}`;
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-3xl">Report cards</h1>
        <p className="mt-1 text-ivory-100/60">
          {classroom ? `${classroom.arm} · ${classroom.name}` : "No classes yet"} · {session} ·{" "}
          Term {term} ·{" "}
          {withMarks
            ? `${withMarks} pupil${withMarks === 1 ? "" : "s"} with marks, class average ${classAverage}`
            : "no marks recorded yet"}
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
          Session
          <input
            name="session"
            defaultValue={session}
            className="mt-1 block w-40 rounded-md border border-ivory-100/20 bg-navy-950 px-3 py-2 text-sm"
          />
        </label>
        <label className="text-sm text-ivory-100/70">
          Term
          <select
            name="term"
            defaultValue={String(term)}
            className="mt-1 block w-28 rounded-md border border-ivory-100/20 bg-navy-950 px-3 py-2 text-sm"
          >
            {[1, 2, 3].map((t) => (
              <option key={t} value={t}>
                Term {t}
              </option>
            ))}
          </select>
        </label>
        <button className="rounded-full bg-gold-500 px-5 py-2 text-sm font-semibold text-navy-950">
          Load
        </button>
      </form>

      {report.length ? (
        <div className="overflow-x-auto rounded-2xl border border-ivory-100/10 bg-navy-800/60">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="text-xs uppercase tracking-wider text-ivory-100/40">
              <tr>
                <th className="px-4 py-3">Pos</th>
                <th className="px-4 py-3">Pupil</th>
                <th className="px-4 py-3">Subjects</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Average</th>
                <th className="px-4 py-3">Grade</th>
                <th className="px-4 py-3">Result</th>
              </tr>
            </thead>
            <tbody>
              {report.map((r) => (
                <tr key={r.studentId} className="border-t border-ivory-100/10">
                  <td className="px-4 py-3 tabular-nums text-ivory-100/70">
                    {r.position ? ordinal(r.position) + (r.tied > 1 ? "=" : "") : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/reports/${r.studentId}?session=${encodeURIComponent(session)}&term=${term}`}
                      className="font-medium text-ivory-100 hover:text-gold-500"
                    >
                      {r.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 tabular-nums text-ivory-100/70">{r.subjectCount}</td>
                  <td className="px-4 py-3 tabular-nums text-ivory-100/70">{r.totalScore}</td>
                  <td className="px-4 py-3 tabular-nums font-semibold">{r.average || "—"}</td>
                  <td className="px-4 py-3">
                    {r.subjectCount ? (
                      <span className="rounded-full bg-navy-950/60 px-2.5 py-1 text-xs font-semibold text-gold-500">
                        {r.grade.code}
                      </span>
                    ) : (
                      <span className="text-ivory-100/30">no marks</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {publishedSet.has(r.studentId) ? (
                      <span className="text-xs font-semibold text-emerald-600">Published</span>
                    ) : (
                      <span className="text-xs text-ivory-100/40">Draft</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="rounded-2xl border border-ivory-100/10 bg-navy-800/60 p-8 text-center text-ivory-100/50">
          No pupils in this class yet — enrol students first.
        </p>
      )}

      <p className="max-w-3xl text-xs text-ivory-100/40">
        Report cards are computed live from the marks entered on the Scores page —
        open a pupil to add remarks and publish their result to the portal.
      </p>

      <p className="text-xs text-ivory-100/30">
        Term links:{" "}
        {[1, 2, 3].map((t) => (
          <Link key={t} href={link({ term: String(t) })} className="mr-2 text-gold-500 hover:underline">
            Term {t}
          </Link>
        ))}
      </p>
    </div>
  );
}
