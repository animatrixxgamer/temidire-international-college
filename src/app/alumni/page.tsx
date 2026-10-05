import type { Metadata } from "next";
import { Reveal, SplitHeading } from "@/components/motion/primitives";
import { CountUp } from "@/components/motion/Extras";
import { alumni, school } from "@/content/siteContent";

export const metadata: Metadata = {
  title: "Alumni",
  description: "Where Temidire graduates go — and how to stay in touch.",
};

export default function AlumniPage() {
  return (
    <main className="pt-16">
      <section className="mx-auto max-w-4xl px-6 pb-12 pt-20 text-center">
        <Reveal>
          <p className="text-sm tracking-wide text-gold-500">Alumni</p>
          <SplitHeading text="Once Temidire, always Temidire" className="mt-3 font-serif text-3xl md:text-5xl" />
        </Reveal>
      </section>

      <section className="mx-auto max-w-4xl px-6 pb-16">
        <div className="grid grid-cols-3 gap-6 text-center">
          {[
            { label: "Sets graduated", value: 18, suffix: "" },
            { label: "Alumni worldwide", value: 1200, suffix: "+" },
            { label: "In university or beyond", value: 92, suffix: "%" },
          ].map((s) => (
            <Reveal key={s.label}>
              <p className="font-serif text-4xl text-gold-500 md:text-5xl">
                <CountUp to={s.value} suffix={s.suffix} />
              </p>
              <p className="mt-1 text-sm text-ivory-100/60">{s.label}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 pb-20">
        <div className="grid gap-6 sm:grid-cols-2">
          {alumni.map((a, i) => (
            <Reveal key={a.name} delay={i * 0.06}>
              <div className="group relative h-44 [perspective:900px]">
                <div className="relative h-full w-full transition-transform duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
                  <div className="absolute inset-0 grid place-items-center rounded-2xl border border-ivory-100/12 bg-navy-800 p-6 [backface-visibility:hidden]">
                    <div className="text-center">
                      <p className="font-serif text-xl">{a.name}</p>
                      <p className="mt-1 text-sm text-gold-500">Class of {a.set}</p>
                      <p className="mt-3 text-xs text-ivory-100/40 group-hover:opacity-0">Hover to see where they are now →</p>
                    </div>
                  </div>
                  <div className="absolute inset-0 grid place-items-center rounded-2xl bg-gold-500 p-6 text-navy-950 [backface-visibility:hidden] [transform:rotateY(180deg)]">
                    <p className="text-center font-semibold">{a.now}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-ivory-100 py-20 text-navy-950">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <Reveal>
            <h2 className="font-serif text-3xl">Are you a Temidire graduate?</h2>
            <p className="mx-auto mt-3 max-w-xl opacity-70">
              We're building the alumni register — send your name, set and what you do now, and we'll keep you in
              the loop for reunions and mentorship.
            </p>
            <a
              href={`mailto:${school.email}?subject=Alumni%20register`}
              className="mt-8 inline-block rounded-full bg-navy-950 px-7 py-3 font-semibold text-ivory-100"
            >
              Join the alumni register
            </a>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
