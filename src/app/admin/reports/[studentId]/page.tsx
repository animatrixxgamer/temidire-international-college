import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireStaff } from "@/lib/guards";
import { prisma } from "@/lib/db";
import { buildClassReport, ordinal, remarkFor, attendanceTally, type ScoreRow } from "@/lib/report";
import { saveResultRemarks, setResultPublished } from "@/app/admin/actions";
import { school } from "@/content/siteContent";
import PrintButton from "@/components/dashboard/PrintButton";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Report card" };

export default async function ReportCardPage({
  params,
  searchParams,
}: {
  params: Promise<{ studentId: string }>;
  searchParams: Promise<{ session?: string; term?: string }>;
}) {
  await requireStaff();
  const { studentId } = await params;
  const q = await searchParams;

  const [student, sessionRow, termRow] = await Promise.all([
    prisma.studentProfile.findUnique({
      where: { id: studentId },
      include: { user: { select: { name: true } }, classroom: true },
    }),
    prisma.settings.findUnique({ where: { key: "current_session" } }),
    prisma.settings.findUnique({ where: { key: "current_term" } }),
  ]);
  if (!student) notFound();

  const session = q.session || sessionRow?.value || "2026/2027";
  const term = Math.min(3, Math.max(1, Number(q.term || termRow?.value || "1") || 1));

  const [scores, attendance, sheet] = await Promise.all([
    prisma.score.findMany({
      where: { studentId: student.id, session, term },
      include: { subject: { select: { code: true, name: true } } },
    }),
    prisma.attendanceRecord.findMany({ where: { studentId: student.id }, select: { status: true } }),
    prisma.resultSheet.findUnique({
      where: { studentId_session_term: { studentId: student.id, session, term } },
    }),
  ]);

  // Class position needs every classmate's marks for the same term.
  const classmates = student.classroomId
    ? await prisma.studentProfile.findMany({
        where: { classroomId: student.classroomId, active: true },
        include: { user: { select: { name: true } }, scores: { where: { session, term } } },
      })
    : [];
  const classReport = buildClassReport(
    classmates.map((c) => ({
      studentId: c.id,
      name: c.user.name,
      subjects: c.scores.map((s) => ({
        subjectId: s.subjectId,
        code: "",
        name: s.subjectId,
        ca: s.ca,
        exam: s.exam,
        total: s.total,
        grade: s.grade,
      })),
    })),
  );
  const mine = classReport.find((r) => r.studentId === student.id);

  const subjects: ScoreRow[] = scores
    .map((s) => ({
      subjectId: s.subjectId,
      code: s.subject.code,
      name: s.subject.name,
      ca: s.ca,
      exam: s.exam,
      total: s.total,
      grade: s.grade,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const attendance_ = attendanceTally(attendance);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link
          href={`/admin/reports?class=${student.classroomId ?? ""}&session=${encodeURIComponent(session)}&term=${term}`}
          className="text-sm text-gold-500 hover:text-gold-300"
        >
          ← Back to class
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-xs uppercase tracking-wider text-ivory-100/40">
            {sheet?.published ? "Published to portal" : "Draft"}
          </span>
          <PrintButton />
        </div>
      </div>

      {/* ————— The report card itself (this is what prints) ————— */}
      <article className="rounded-2xl border border-ivory-100/10 bg-ivory-100 p-6 text-navy-950 sm:p-8">
        <header className="flex flex-col gap-2 border-b border-navy-950/15 pb-5 text-center">
          <p className="font-serif text-2xl">{school.name}</p>
          <p className="text-xs uppercase tracking-[0.2em] text-navy-700/70">{school.crestMotto}</p>
          <p className="text-sm text-navy-700/70">{school.address}</p>
          <p className="mt-2 font-serif text-lg">Terminal Report Sheet</p>
          <p className="text-sm text-navy-700/70">
            {session} session · Term {term}
          </p>
        </header>

        <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-4">
          <div className="col-span-2">
            <dt className="text-navy-700/60">Pupil</dt>
            <dd className="font-semibold">{student.user.name}</dd>
          </div>
          <div>
            <dt className="text-navy-700/60">Admission no.</dt>
            <dd className="font-semibold">{student.admissionNo}</dd>
          </div>
          <div>
            <dt className="text-navy-700/60">Class</dt>
            <dd className="font-semibold">{student.classroom?.name ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-navy-700/60">Subjects</dt>
            <dd className="font-semibold">{subjects.length}</dd>
          </div>
          <div>
            <dt className="text-navy-700/60">Average</dt>
            <dd className="font-semibold">{mine?.subjectCount ? mine.average : "—"}</dd>
          </div>
          <div>
            <dt className="text-navy-700/60">Grade</dt>
            <dd className="font-semibold">{mine?.subjectCount ? mine.grade.code : "—"}</dd>
          </div>
          <div>
            <dt className="text-navy-700/60">Position</dt>
            <dd className="font-semibold">
              {mine?.position ? `${ordinal(mine.position)} of ${classmates.length}` : "—"}
            </dd>
          </div>
        </dl>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="border-y border-navy-950/15 text-xs uppercase tracking-wider text-navy-700/60">
              <tr>
                <th className="py-2">Subject</th>
                <th className="py-2 text-right">C.A. (40)</th>
                <th className="py-2 text-right">Exam (60)</th>
                <th className="py-2 text-right">Total (100)</th>
                <th className="py-2 text-right">Grade</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((s) => (
                <tr key={s.subjectId} className="border-b border-navy-950/10">
                  <td className="py-2">{s.name}</td>
                  <td className="py-2 text-right tabular-nums">{s.ca}</td>
                  <td className="py-2 text-right tabular-nums">{s.exam}</td>
                  <td className="py-2 text-right font-semibold tabular-nums">{s.total}</td>
                  <td className="py-2 text-right font-semibold tabular-nums">{s.grade}</td>
                </tr>
              ))}
              {!subjects.length && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-navy-700/60">
                    No marks recorded for this pupil this term.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
          <div className="rounded-lg border border-navy-950/10 p-3">
            <p className="text-xs uppercase tracking-wider text-navy-700/60">Attendance (to date)</p>
            <p className="mt-1">
              Present {attendance_.present} · Late {attendance_.late} · Absent{" "}
              {attendance_.absent} <span className="text-navy-700/60">({attendance_.total} days marked)</span>
            </p>
          </div>
          <div className="rounded-lg border border-navy-950/10 p-3">
            <p className="text-xs uppercase tracking-wider text-navy-700/60">Form remark</p>
            <p className="mt-1">{remarkFor(mine?.average ?? 0)}</p>
          </div>
        </div>

        <div className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
          <div className="rounded-lg border border-navy-950/10 p-3">
            <p className="text-xs uppercase tracking-wider text-navy-700/60">Class teacher's remark</p>
            <p className="mt-1 min-h-6 whitespace-pre-wrap">
              {sheet?.teacherRemark || <span className="text-navy-700/40">—</span>}
            </p>
          </div>
          <div className="rounded-lg border border-navy-950/10 p-3">
            <p className="text-xs uppercase tracking-wider text-navy-700/60">Principal's remark</p>
            <p className="mt-1 min-h-6 whitespace-pre-wrap">
              {sheet?.principalRemark || <span className="text-navy-700/40">—</span>}
            </p>
          </div>
        </div>

        <footer className="mt-5 flex flex-col justify-between gap-2 border-t border-navy-950/15 pt-4 text-xs text-navy-700/60 sm:flex-row">
          <span>
            Grading: A1 75–100 · B2 70–74 · B3 65–69 · C4 60–64 · C5 55–59 · C6 50–54 ·
            D7 45–49 · E8 40–44 · F9 0–39
          </span>
          <span>{sheet?.publishedAt ? `Published ${new Date(sheet.publishedAt).toLocaleDateString("en-NG")}` : "Draft"}</span>
        </footer>
      </article>

      {/* ————— Editing controls (never printed) ————— */}
      <div className="grid gap-4 print:hidden lg:grid-cols-2">
        <form
          action={saveResultRemarks}
          className="space-y-3 rounded-2xl border border-ivory-100/10 bg-navy-800/60 p-5"
        >
          <h2 className="font-serif text-xl">Remarks</h2>
          <input type="hidden" name="studentId" value={student.id} />
          <input type="hidden" name="session" value={session} />
          <input type="hidden" name="term" value={term} />
          <label className="block text-sm text-ivory-100/70">
            Class teacher
            <textarea
              name="teacherRemark"
              defaultValue={sheet?.teacherRemark ?? ""}
              rows={3}
              className="mt-1 block w-full rounded-md border border-ivory-100/20 bg-navy-950 px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-sm text-ivory-100/70">
            Principal
            <textarea
              name="principalRemark"
              defaultValue={sheet?.principalRemark ?? ""}
              rows={3}
              className="mt-1 block w-full rounded-md border border-ivory-100/20 bg-navy-950 px-3 py-2 text-sm"
            />
          </label>
          <button className="rounded-full bg-gold-500 px-5 py-2 text-sm font-semibold text-navy-950">
            Save remarks
          </button>
        </form>

        <div className="space-y-3 rounded-2xl border border-ivory-100/10 bg-navy-800/60 p-5">
          <h2 className="font-serif text-xl">Publish</h2>
          <p className="text-sm text-ivory-100/60">
            Publishing shows this result and the remarks on the pupil's portal.
            Marks are edited on the Scores page; this page only sets the wording and
            visibility.
          </p>
          <form action={setResultPublished}>
            <input type="hidden" name="studentId" value={student.id} />
            <input type="hidden" name="session" value={session} />
            <input type="hidden" name="term" value={term} />
            <input type="hidden" name="publish" value={sheet?.published ? "0" : "1"} />
            <button
              className={
                sheet?.published
                  ? "rounded-full border border-ivory-100/20 px-5 py-2 text-sm font-semibold text-ivory-100 hover:border-ember-500 hover:text-ember-500"
                  : "rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white"
              }
            >
              {sheet?.published ? "Withdraw from portal" : "Publish to portal"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
