import type { Metadata } from "next";
import { redirect } from "next/navigation";
import LogoutButton from "@/components/admin/LogoutButton";
import { TodayTimetable } from "@/components/portal/TodayTimetable";
import { FeeProgressBar } from "@/components/portal/FeeProgressBar";
import { Reveal, SplitHeading } from "@/components/motion/primitives";
import { TransitionLink } from "@/components/motion/PageTransition";
import { getSession } from "@/lib/auth-server";
import { isStaff } from "@/lib/auth";
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

  const first = (session.name || "there").split(" ")[0];
  const roleLabel = session.role === "PARENT" ? "Parent" : "Student";

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
            <h2 className="font-serif text-2xl">Today’s timetable</h2>
            <TodayTimetable week={portalTimetable} className="mt-4" />
          </Reveal>

          <Reveal delay={0.1}>
            <h2 className="font-serif text-2xl">School fees · {portalFees.level}</h2>
            <FeeProgressBar
              paid={portalFees.paid}
              total={portalFees.total}
              status={portalFees.status}
              className="mt-4"
            />
            <p className="mt-4 rounded-[12px] border border-ivory-100/10 bg-navy-800/60 p-4 text-sm text-ivory-100/70">
              Payments are made at the bursary or by bank transfer. The live fee
              table and online payment arrive with Phase 3 — the figures above are
              the current preview.
            </p>
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
