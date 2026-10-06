import type { Metadata } from "next";
import Link from "next/link";
import { Reveal, ImageReveal, SplitHeading } from "@/components/motion/primitives";
import { schools, fees, naira } from "@/content/siteContent";

export const metadata: Metadata = {
  title: "Our schools",
  description: "Creche, Nursery, Primary and Secondary education at Temidire International College, Ondo.",
};

export default function SchoolsPage() {
  return (
    <main className="pt-16">
      <section className="mx-auto max-w-4xl px-6 pb-12 pt-20 text-center">
        <Reveal>
          <p className="text-sm tracking-wide text-gold-500">Creche · Nursery · Primary · Secondary</p>
          <SplitHeading text="The right start at every age" className="mt-3 font-serif text-3xl md:text-5xl" />
        </Reveal>
      </section>

      {schools.map((s, i) => (
        <section
          key={s.id}
          id={s.id}
          className={`${i % 2 ? "bg-ivory-100 text-navy-950" : "bg-navy-950"} scroll-mt-20`}
        >
          <div
            className={`mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 md:grid-cols-2 ${
              i % 2 ? "" : ""
            }`}
          >
            <Reveal className={i % 2 ? "md:order-2" : ""}>
              <p className="text-sm tracking-wide text-gold-500">{s.ages}</p>
              <h2 className="mt-2 font-serif text-3xl md:text-4xl">{s.name}</h2>
              <p className="mt-4 max-w-prose opacity-80">{s.line}</p>
              <p className="mt-4 max-w-prose text-sm opacity-60">
                {i === 0 && "Warm caregivers, gentle routines and lots of supervised play in a bright, safe room."}
                {i === 1 && "Early literacy and numeracy through songs, stories and sand — plus plenty of outdoor play."}
                {i === 2 && "Reading, writing, mathematics and science taught with plenty of attention per child."}
                {i === 3 && "BECE at JSS 3, then WASSCE and NECO at SSS 3 — with mentoring, career guidance and practical labs."}
              </p>
              <p className="mt-6 text-sm">
                <span className="opacity-60">Tuition from </span>
                <span className="font-semibold tabular">
                  {naira(fees[i]?.tuition ?? 0)}
                  <span className="font-normal opacity-60"> / term</span>
                </span>
              </p>
            </Reveal>
            <ImageReveal src={s.image} alt={s.name} className="aspect-[4/3] w-full" />
          </div>
        </section>
      ))}

      <section className="mx-auto max-w-4xl px-6 py-20 text-center">
        <Reveal>
          <h2 className="font-serif text-3xl">Not sure which class fits your child?</h2>
          <p className="mx-auto mt-3 max-w-xl opacity-70">
            Send us the child's age and last school report — we'll advise the right entry point honestly.
          </p>
          <Link
            href="/admissions/apply"
            className="mt-8 inline-block rounded-full bg-gold-500 px-7 py-3 font-semibold text-navy-950 transition hover:brightness-110"
          >
            Start an application
          </Link>
        </Reveal>
      </section>
    </main>
  );
}
