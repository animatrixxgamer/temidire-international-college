import type { Metadata } from "next";
import { redirect } from "next/navigation";
import LogoutButton from "@/components/admin/LogoutButton";
import { TodayTimetable } from "@/components/portal/TodayTimetable";
import { FeeProgressBar, type FeeStatus } from "@/components/portal/FeeProgressBar";
import { Reveal, SplitHeading } from "@/components/motion/primitives";
import { TransitionLink } from "@/components/motion/PageTransition";
import { getSession } from "@/lib/auth-server";
import { isStaff } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { buildClassReport, ordinal } from "@/lib/report";
import { buildWeek } from "@/lib/timetable";
import { portalTimetable, portalFees, school } from "@/content/siteContent";

export const metadata: Metadata = { title: "Student portal" };
export const dynamic = "force-dynamic";

const LINKS = [
  { href: "/news", label: "News & events", line: "Term dates, results and stories" },
  { href: "/gallery", label: "Gallery", line: "Photos from around campus" },
  { href: "/transport", label: "School bus", line: "Routes, stops and pickup times" },
  { href: "/contact", label: "Contact the office", line: "Call, message or send an email" },
];

/**
 * Landing route for STUDENT / PARENT sessions — middleware and the login API
 * both redirect here, so this page must always exist.
 */
export default async function PortalPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/portal");
  if (isStaff(session.role)) redirect("/admin");

  const TITLES = ["mr", "mrs", "ms", "miss", "dr", "prof", "engr", "chief"];
  const firstName = (session.name || "")
    .split(/\s+/)
    .filter(Boolean)
    .find((part) => !TITLES.includes(part.replace(/\./g, "").toLowerCase()));
  const first = firstName || "there";
  const roleLabel = session.role === "PARENT" ? "Parent" : "Student";

  // Resolve the pupil behind this login (a student directly, or a parent's first
  // child who is still on roll). Pupils taken off the active roll keep no access.
  const ownProfile = await prisma.studentProfile.findUnique({
    where: { userId: session.id },
    select: { id: true, active: true },
  });
  let studentId: string | null = ownProfile?.active ? ownProfile.id : null;
  let parentProfile = false;
  if (!ownProfile) {
    const parent = await prisma.parentProfile.findUnique({
      where: { userId: session.id },
      select: {
        children: {
          select: { studentId: true, student: { select: { active: true } } },
        },
      },
    });
    parentProfile = Boolean(parent);
    studentId = parent?.children.find((c) => c.student.active)?.studentId ?? null;
  }
  const accessPaused = (ownProfile !== null && !ownProfile.active) || (parentProfile && !studentId);

  if (accessPaused) {
    return (
      <main className="pt-16">
        <section className="mx-auto max-w-2xl px-6 pb-24 pt-20">
          <Reveal>
            <p className="text-sm tracking-wide text-gold-500">{roleLabel} portal</p>
            <SplitHeading
              text="Portal access is paused"
              className="mt-3 font-serif text-3xl md:text-4xl"
            />
            <p className="mt-6 text-ivory-100/70">
              This pupil is not on the active roll, so results, fees, timetable and
              homework are hidden. Contact the school office if this looks wrong —
              they can return the pupil to the roll.
            </p>
          </Reveal>
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-ivory-100/10 bg-navy-800/60 p-5">
            <div>
              <p className="font-semibold">{session.name}</p>
              <p className="text-xs text-ivory-100/50">{session.email}</p>
            </div>
            <div className="w-40">
              <LogoutButton />
            </div>
          </div>
        </section>
      </main>
    );
  }

  const [sessionRow, termRow] = await Promise.all([
    prisma.settings.findUnique({ where: { key: "current_session" } }),
    prisma.settings.findUnique({ where: { key: "current_term" } }),
  ]);
  const currentSession = sessionRow?.value ?? school.session;
  const currentTerm = Number(termRow?.value ?? "1") || 1;

  // Only a published result is shown, and the position comes from the class's marks.
  let result: {
    average: number;
    grade: string;
    position: number;
    subjectCount: number;
    remark: string;
    sheets: Array<{ name: string; total: number; grade: string }>;
  } | null = null;
  const profile = studentId
    ? await prisma.studentProfile.findUnique({ where: { id: studentId }, select: { classroomId: true } })
    : null;
  if (studentId && profile?.classroomId) {
    const sheet = await prisma.resultSheet.findUnique({
      where: { studentId_session_term: { studentId, session: currentSession, term: currentTerm } },
    });
    if (sheet?.published) {
      const [scores, classmates] = await Promise.all([
        prisma.score.findMany({
          where: { studentId, session: currentSession, term: currentTerm },
          include: { subject: { select: { name: true } } },
        }),
        prisma.studentProfile.findMany({
          where: { classroomId: profile.classroomId, active: true },
          include: { user: { select: { name: true } }, scores: { where: { session: currentSession, term: currentTerm } } },
        }),
      ]);
      const classReport = buildClassReport(
        classmates.map((c) => ({
          studentId: c.id,
          name: c.user.name,
          subjects: c.scores.map((s) => ({
            subjectId: s.subjectId,
            code: "",
            name: "",
            ca: s.ca,
            exam: s.exam,
            total: s.total,
            grade: s.grade,
          })),
        })),
      );
      const mine = classReport.find((r) => r.studentId === studentId);
      if (mine) {
        result = {
          average: mine.average,
          grade: mine.grade.code,
          position: mine.position,
          subjectCount: mine.subjectCount,
          remark: mine.grade.remark,
          sheets: scores
            .map((s) => ({ name: s.subject.name, total: s.total, grade: s.grade }))
            .sort((a, b) => a.name.localeCompare(b.name)),
        };
      }
    }
  }

  // The class's real timetable, teacher names resolved from their profiles.
  const slots = profile?.classroomId
    ? await prisma.timetableSlot.findMany({
        where: { classroomId: profile.classroomId },
        include: { subject: { select: { name: true } } },
      })
    : [];
  const teacherIds = [...new Set(slots.map((s) => s.teacherId).filter(Boolean))] as string[];
  const staff = teacherIds.length
    ? await prisma.staffProfile.findMany({
        where: { id: { in: teacherIds } },
        include: { user: { select: { name: true } } },
      })
    : [];
  const teacherName = new Map(staff.map((s) => [s.id, s.user.name]));
  const week = buildWeek(
    slots
      .filter((s) => s.subject)
      .map((s) => ({
        day: s.day,
        period: s.period,
        subjectName: s.subject!.name,
        teacher: s.teacherId ? teacherName.get(s.teacherId) : undefined,
      })),
  );
  const hasTimetable = Object.keys(week).length > 0;

  // Notices addressed to this role, homework for this pupil's class, and their bills.
  const audience = session.role === "PARENT" ? "PARENTS" : "STUDENTS";
  const [announcements, assignments, invoices] = await Promise.all([
    prisma.announcement.findMany({
      where: { audience: { in: ["ALL", audience] } },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
    prisma.assignment.findMany({
      where: { classroomId: profile?.classroomId ?? "__none__" },
      include: {
        subject: { select: { name: true } },
        classroom: { select: { name: true } },
      },
      orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
      take: 5,
    }),
    prisma.feeInvoice.findMany({
      where: { studentId: studentId ?? "__none__", session: currentSession, term: currentTerm },
    }),
  ]);

  const feesTotal = invoices.reduce((sum, i) => sum + i.amount, 0);
  const feesPaid = invoices.reduce((sum, i) => sum + i.paidAmount, 0);
  const feeData: { paid: number; total: number; status: FeeStatus; label: string } = invoices.length
    ? {
        paid: feesPaid,
        total: feesTotal,
        status: feesPaid >= feesTotal ? "PAID" : feesPaid > 0 ? "PARTIAL" : "UNPAID",
        label: `${currentSession} · Term ${currentTerm}`,
      }
    : { paid: portalFees.paid, total: portalFees.total, status: portalFees.status, label: portalFees.level };

  return (
    <main className="pt-16">
      <section className="mx-auto max-w-6xl px-6 pb-24 pt-20">
        <Reveal>
          <p className="text-sm tracking-wide text-gold-500">
            {roleLabel} portal · {school.session} session
          </p>
          <SplitHeading
            text={`Welcome back, ${first}`}
            className="mt-3 font-serif text-3xl md:text-5xl"
          />
          <p className="mt-6 max-w-2xl text-ivory-100/70">
            Today’s timetable, the fee position for this term and the notices that
            matter, all in one place. Office hours: {school.hours}.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <Reveal delay={0.05}>
            <h2 className="font-serif text-2xl">This term’s result · Term {currentTerm}</h2>
            {result ? (
              <div className="mt-4 rounded-2xl border border-ivory-100/10 bg-navy-800/60 p-5">
                <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1">
                  <p className="font-serif text-4xl">{result.average}</p>
                  <p className="text-sm text-ivory-100/60">average over {result.subjectCount} subject{result.subjectCount === 1 ? "" : "s"}</p>
                  <span className="rounded-full bg-navy-950/60 px-3 py-1 text-xs font-semibold text-gold-500">
                    {result.grade}
                  </span>
                  {result.position ? (
                    <span className="text-sm text-ivory-100/70">{ordinal(result.position)} in class</span>
                  ) : null}
                </div>
                <p className="mt-2 text-sm text-gold-500">{result.remark}</p>
                <ul className="mt-4 divide-y divide-ivory-100/10 text-sm">
                  {result.sheets.map((s) => (
                    <li key={s.name} className="flex items-center justify-between py-1.5">
                      <span className="text-ivory-100/80">{s.name}</span>
                      <span className="tabular-nums text-ivory-100/60">
                        {s.total} · {s.grade}
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-xs text-ivory-100/40">
                  Remarks and the printable report card are issued by the school office.
                </p>
              </div>
            ) : (
              <p className="mt-4 rounded-2xl border border-ivory-100/10 bg-navy-800/60 p-5 text-sm text-ivory-100/60">
                No published result for this term yet. Results appear here once the
                school office publishes them.
              </p>
            )}
          </Reveal>

          <Reveal delay={0.08}>
            <h2 className="font-serif text-2xl">Today’s timetable</h2>
            <TodayTimetable
              week={hasTimetable ? week : portalTimetable}
              className="mt-4"
            />
            {!hasTimetable && (
              <p className="mt-2 text-xs text-ivory-100/40">
                Preview timetable — the school has not published this class’s week yet.
              </p>
            )}
          </Reveal>

          <Reveal delay={0.1}>
            <h2 className="font-serif text-2xl">School fees · {feeData.label}</h2>
            <FeeProgressBar
              paid={feeData.paid}
              total={feeData.total}
              status={feeData.status}
              className="mt-4"
            />
            <p className="mt-4 rounded-[12px] border border-ivory-100/10 bg-navy-800/60 p-4 text-sm text-ivory-100/70">
              {invoices.length
                ? "Payments are made at the bursary or by bank transfer. This balance comes from the school's invoice record and updates as payments are recorded."
                : "Payments are made at the bursary or by bank transfer. No invoice has been raised for this term yet — the figures above are a preview."}
            </p>
          </Reveal>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Reveal delay={0.05}>
            <h2 className="font-serif text-2xl">Notices</h2>
            <ul className="mt-4 space-y-3">
              {announcements.map((a) => (
                <li key={a.id} className="rounded-2xl border border-ivory-100/10 bg-navy-800/60 p-5">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="font-semibold">{a.title}</p>
                    <span className="text-xs text-ivory-100/40">
                      {new Date(a.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short" })}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-ivory-100/70">{a.body}</p>
                </li>
              ))}
              {announcements.length === 0 && (
                <li className="rounded-2xl border border-ivory-100/10 bg-navy-800/60 p-5 text-sm text-ivory-100/60">
                  No notices right now. Term news lands here as the office posts it.
                </li>
              )}
            </ul>
          </Reveal>

          <Reveal delay={0.08}>
            <h2 className="font-serif text-2xl">Homework</h2>
            <ul className="mt-4 space-y-3">
              {assignments.map((a) => (
                <li key={a.id} className="rounded-2xl border border-ivory-100/10 bg-navy-800/60 p-5">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="font-semibold">{a.title}</p>
                    <span className="rounded-full bg-gold-500/10 px-3 py-0.5 text-xs text-gold-300">
                      {a.dueDate
                        ? `Due ${new Date(a.dueDate).toLocaleDateString("en-NG", { day: "numeric", month: "short" })}`
                        : "No due date"}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-ivory-100/70">{a.description}</p>
                  <p className="mt-2 text-xs text-ivory-100/40">
                    {a.classroom.name}
                    {a.subject ? ` · ${a.subject.name}` : " · General"}
                  </p>
                </li>
              ))}
              {assignments.length === 0 && (
                <li className="rounded-2xl border border-ivory-100/10 bg-navy-800/60 p-5 text-sm text-ivory-100/60">
                  No homework set for this class. Check back after the next lesson.
                </li>
              )}
            </ul>
          </Reveal>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {LINKS.map((l, i) => (
            <Reveal key={l.href} delay={i * 0.05}>
              <TransitionLink
                href={l.href}
                className="block h-full rounded-2xl border border-ivory-100/10 bg-navy-800/60 p-5 transition hover:border-gold-500"
              >
                <p className="font-serif text-xl">{l.label}</p>
                <p className="mt-1 text-sm text-ivory-100/60">{l.line}</p>
              </TransitionLink>
            </Reveal>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-ivory-100/10 bg-navy-800/60 p-5">
          <div>
            <p className="font-semibold">{session.name}</p>
            <p className="text-xs text-ivory-100/50">{session.email}</p>
          </div>
          <div className="w-40">
            <LogoutButton />
          </div>
        </div>
      </section>
    </main>
  );
}
