import type { Metadata } from "next";
import { Reveal, SplitHeading } from "@/components/motion/primitives";
import { Section, Item } from "@/components/motion/SmoothReveal";
import { departments, gradingSystem, events as calendar } from "@/content/siteContent";

export const metadata: Metadata = {
  title: "Academics",
  description: "Nigerian curriculum at Temidire: BECE, WASSCE and NECO preparation with strong continuous assessment.",
};

export default function AcademicsPage() {
  return (
    <main className="pt-16">
      <section className="mx-auto max-w-4xl px-6 pb-16 pt-20 text-center">
        <Reveal>
          <p className="text-sm tracking-wide text-gold-500">Academics</p>
          <SplitHeading
            text="The Nigerian curriculum, taught with care"
            className="mt-3 font-serif text-3xl md:text-5xl"
          />
          <p className="mx-auto mt-6 max-w-2xl text-ivory-100/70">
            From nursery numeracy to SSS 3 sciences, we follow the Nigerian national curriculum — with continuous
            assessment published every half term, so progress is never a surprise in June.
          </p>
        </Reveal>
      </section>

      {/* Exams */}
      <Section className="bg-navy-900 py-20" parallax={0}>
        <div className="mx-auto grid max-w-6xl gap-6 px-6 md:grid-cols-3">
          {[
            ["BECE — JSS 3", "Basic Education Certificate Examination, prepared for from JSS 1 with weekly practice."],
            ["WASSCE — SSS 3", "West African Senior School Certificate, with past-paper drills and practical labs."],
            ["NECO — SSS 3", "Every candidate also sits NECO, doubling the route into tertiary education."],
          ].map(([h, t]) => (
            <Item key={h} className="rounded-2xl border border-ivory-100/10 bg-navy-800 p-6">
              <h2 className="font-serif text-xl text-gold-500">{h}</h2>
              <p className="mt-2 text-sm text-ivory-100/70">{t}</p>
            </Item>
          ))}
        </div>
      </Section>

      {/* Departments — ivory */}
      <section className="bg-ivory-100 py-24 text-navy-950">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <h2 className="font-serif text-3xl md:text-4xl">Departments</h2>
          </Reveal>
          <div className="mt-10 space-y-6">
            {departments.map((d, i) => (
              <Reveal key={d.name} delay={i * 0.08}>
                <div className="flex flex-col gap-2 border-l-2 border-gold-500 pl-6 md:flex-row md:items-baseline md:gap-8">
                  <h3 className="w-56 shrink-0 font-serif text-2xl">{d.name}</h3>
                  <p className="opacity-75">{d.subjects}</p>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Grading table */}
          <Reveal>
            <h3 className="mt-20 font-serif text-2xl">How we grade (WAEC scale)</h3>
            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead>
                  <tr className="border-b-2 border-navy-950/20 text-xs uppercase tracking-wider opacity-60">
                    <th className="py-3 pr-4">Grade</th>
                    <th className="py-3 pr-4">Score range</th>
                    <th className="py-3">Remark</th>
                  </tr>
                </thead>
                <tbody>
                  {gradingSystem.map((g) => (
                    <tr key={g.grade} className="border-b border-navy-950/10 transition hover:bg-white/60">
                      <td className="py-3 pr-4">
                        <span className="inline-grid h-8 w-10 place-items-center rounded-md bg-navy-950 font-semibold text-ivory-100">
                          {g.grade}
                        </span>
                      </td>
                      <td className="py-3 pr-4 tabular">{g.range}%</td>
                      <td className="py-3">{g.remark}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-sm opacity-60">
              Each term: continuous assessment out of 40 + examination out of 60. Results are published on the
              parent portal when the Principal releases them.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Calendar */}
      <section className="mx-auto max-w-4xl px-6 py-24">
        <Reveal>
          <h2 className="font-serif text-3xl md:text-4xl">This term's key dates</h2>
        </Reveal>
        <div className="mt-10 space-y-5">
          {calendar.map((e, i) => (
            <Reveal key={e.title} delay={i * 0.06}>
              <div className="flex items-center gap-6">
                <div className="w-28 shrink-0 text-sm text-gold-500 tabular">
                  {new Date(e.date).toLocaleDateString("en-NG", { day: "numeric", month: "short" })}
                </div>
                <div className="h-px flex-1 bg-gradient-to-r from-gold-500/60 to-transparent" />
                <div className="w-48 shrink-0 text-right font-semibold md:w-auto">{e.title}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </main>
  );
}
