import type { Metadata } from "next";
import Timeline from "@/components/motion/Timeline";
import { Reveal, SplitHeading, ImageReveal } from "@/components/motion/primitives";
import { Section, Item } from "@/components/motion/SmoothReveal";
import Crest from "@/components/motion/Crest";
import { school, timeline, principal } from "@/content/siteContent";

export const metadata: Metadata = {
  title: "About us",
  description: "The story, values and people of Temidire International College, Ondo.",
};

export default function AboutPage() {
  return (
    <main className="pt-16">
      {/* Intro */}
      <section className="mx-auto max-w-4xl px-6 pb-16 pt-20 text-center">
        <Reveal>
          <Crest className="mx-auto h-28 w-24" motto={school.crestMotto} />
          <p className="mt-6 text-sm tracking-wide text-gold-500">Our story</p>
          <SplitHeading
            text="A small school with serious standards, built for Ondo Town"
            className="mx-auto mt-3 max-w-2xl font-serif text-3xl md:text-5xl"
          />
          <p className="mx-auto mt-6 max-w-2xl text-ivory-100/70">
            Founded in {school.founded}, Temidire International College grew from a handful of pupils into a full
            creche-to-secondary school serving families across Ondo Town — without ever growing so large that a
            child becomes invisible.
          </p>
        </Reveal>
      </section>

      {/* Timeline (spine draws on scroll) */}
      <section className="bg-navy-950">
        <Timeline items={timeline} />
      </section>

      {/* Vision / mission / values — ivory */}
      <section className="bg-ivory-100 py-24 text-navy-950">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 md:grid-cols-3">
          {[
            { h: "Vision", t: "To be the school in Ondo State where character and curiosity grow together." },
            { h: "Mission", t: "To teach every child as an individual, hold kind but high standards, and keep parents close partners." },
            { h: "Core values", t: "Curiosity · Integrity · Diligence · Respect · Service" },
          ].map((v) => (
            <Reveal key={v.h}>
              <div className="border-l-2 border-gold-500 pl-6">
                <h2 className="font-serif text-2xl">{v.h}</h2>
                <p className="mt-3 opacity-75">{v.t}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Principal's welcome */}
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-24 md:grid-cols-[2fr_3fr]">
        <ImageReveal src={principal.photo} alt={principal.name} className="aspect-[4/5] w-full max-w-sm" />
        <Reveal>
          <p className="text-sm tracking-wide text-gold-500">Welcome from the {principal.title.toLowerCase()}</p>
          <blockquote className="mt-4 font-serif text-2xl leading-relaxed md:text-3xl">
            "{principal.welcome}"
          </blockquote>
          <p className="mt-6 font-semibold text-gold-500">{principal.name}</p>
          <p className="text-sm text-ivory-100/60">{principal.title}, {school.name}</p>
        </Reveal>
      </section>

      {/* Facilities + accreditation */}
      <Section className="bg-navy-900 py-24" parallax={0}>
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <h2 className="font-serif text-3xl md:text-4xl">Our campus</h2>
          </Reveal>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              ["Science laboratories", "Physics, chemistry and biology labs with weekly practicals for every SSS class."],
              ["Library & ICT room", "A quiet reading room plus a connected computer lab for digital skills from Primary 4."],
              ["Sports & play", "A football field, basketball court and safe separate playgrounds for the early years."],
            ].map(([h, t]) => (
              <Item key={h} className="rounded-2xl border border-ivory-100/10 bg-navy-800 p-6">
                <h3 className="font-serif text-xl text-gold-500">{h}</h3>
                <p className="mt-2 text-sm text-ivory-100/70">{t}</p>
              </Item>
            ))}
          </div>
          <Reveal delay={0.15}>
            <div className="mt-12 flex flex-wrap items-center gap-4 text-sm text-ivory-100/60">
              <span className="rounded-full border border-gold-500/40 px-4 py-2 text-gold-500">Ondo State Ministry of Education — approved</span>
              <span className="rounded-full border border-gold-500/40 px-4 py-2 text-gold-500">WAEC examination centre</span>
              <span className="rounded-full border border-gold-500/40 px-4 py-2 text-gold-500">NECO examination centre</span>
            </div>
          </Reveal>
        </div>
      </Section>
    </main>
  );
}
