import type { Metadata } from "next";
import Link from "next/link";
import AdmissionsSteps from "@/components/motion/AdmissionsSteps";
import { Reveal, SplitHeading } from "@/components/motion/primitives";
import RequirementsTabs from "@/components/RequirementsTabs";
import { fees, naira, admissionSteps } from "@/content/siteContent";

export const metadata: Metadata = {
  title: "Admissions",
  description: "How to apply to Temidire International College, Ondo — requirements, fees and the online application.",
};

export default function AdmissionsPage() {
  const total = (f: (typeof fees)[number]) => f.tuition + f.levies;

  return (
    <main className="pt-16">
      <section className="mx-auto max-w-4xl px-6 pb-10 pt-20 text-center">
        <Reveal>
          <p className="text-sm tracking-wide text-gold-500">Admissions 2026/2027</p>
          <SplitHeading text="Applying to Temidire" className="mt-3 font-serif text-4xl md:text-6xl" />
          <p className="mx-auto mt-6 max-w-2xl text-ivory-100/70">
            Applications are open from Creche to SSS 1. The whole process, from first form to first day, usually
            takes about three weeks.
          </p>
        </Reveal>
      </section>

      <AdmissionsSteps steps={admissionSteps} />

      {/* Requirements */}
      <section className="mx-auto max-w-4xl px-6 py-16">
        <Reveal>
          <h2 className="font-serif text-3xl">What you'll need</h2>
          <p className="mt-2 text-ivory-100/70">Requirements by level — bring originals when you visit.</p>
        </Reveal>
        <div className="mt-8">
          <RequirementsTabs />
        </div>
      </section>

      {/* Fees */}
      <section className="bg-ivory-100 py-24 text-navy-950">
        <div className="mx-auto max-w-4xl px-6">
          <Reveal>
            <h2 className="font-serif text-3xl md:text-4xl">Fees per term</h2>
            <p className="mt-2 opacity-70">
              Sibling discounts apply from the third child. Transport is optional, per route.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="mt-8 overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead>
                  <tr className="border-b-2 border-navy-950/20 text-xs uppercase tracking-wider opacity-60">
                    <th className="py-3 pr-4">Level</th>
                    <th className="py-3 pr-4 text-right">Tuition</th>
                    <th className="py-3 pr-4 text-right">Levies</th>
                    <th className="py-3 pr-4 text-right">Transport (optional)</th>
                    <th className="py-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {fees.map((f) => (
                    <tr key={f.level} className="border-b border-navy-950/10 transition hover:bg-white/60">
                      <td className="py-3 pr-4 font-semibold">{f.level}</td>
                      <td className="py-3 pr-4 text-right tabular">{naira(f.tuition)}</td>
                      <td className="py-3 pr-4 text-right tabular">{naira(f.levies)}</td>
                      <td className="py-3 pr-4 text-right tabular">{naira(f.transport)}</td>
                      <td className="py-3 text-right font-semibold tabular">{naira(total(f))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs opacity-50">Fees shown are placeholders pending confirmation by the bursar.</p>
          </Reveal>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-6 py-20 text-center">
        <Reveal>
          <h2 className="font-serif text-3xl">Ready to apply?</h2>
          <p className="mx-auto mt-3 max-w-xl opacity-70">
            The online form takes about five minutes. You can stop and continue later — your answers save themselves.
          </p>
          <Link
            href="/admissions/apply"
            className="mt-8 inline-block rounded-full bg-gold-500 px-8 py-4 font-semibold text-navy-950 transition hover:brightness-110"
          >
            Start an application
          </Link>
        </Reveal>
      </section>
    </main>
  );
}
