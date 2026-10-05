import type { Metadata } from "next";
import { Reveal, SplitHeading, ImageReveal } from "@/components/motion/primitives";
import { Section, Item } from "@/components/motion/SmoothReveal";

export const metadata: Metadata = {
  title: "Student life",
  description: "Clubs, houses, sports and cultural life at Temidire International College.",
};

const CLUBS = ["Debate & Press", "JETS Club", "Cultural Troupe", "Chess", "Home Economics", "Robotics", "Choir", "Scouts & Guides", "Football Academy"];

export default function StudentLifePage() {
  return (
    <main className="pt-16">
      <section className="mx-auto max-w-4xl px-6 pb-12 pt-20 text-center">
        <Reveal>
          <p className="text-sm tracking-wide text-gold-500">Student life</p>
          <SplitHeading text="School is also what happens between lessons" className="mt-3 font-serif text-3xl md:text-5xl" />
        </Reveal>
      </section>

      {/* Clubs strip */}
      <section className="overflow-hidden pb-8">
        <div className="flex gap-4 overflow-x-auto px-6 pb-4 [scrollbar-width:thin]" style={{ scrollSnapType: "x mandatory" }}>
          {CLUBS.map((c, i) => (
            <div
              key={c}
              className="shrink-0 rounded-2xl border border-ivory-100/12 bg-navy-800 p-6"
              style={{ scrollSnapAlign: "start", minWidth: 220 }}
            >
              <p className="font-serif text-lg text-gold-500">{String(i + 1).padStart(2, "0")}</p>
              <p className="mt-2 font-semibold">{c}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Houses + sports */}
      <Section className="bg-navy-900 py-24" parallax={0}>
        <div className="mx-auto grid max-w-6xl gap-10 px-6 md:grid-cols-2">
          <Item>
            <ImageReveal src="/images/sports-day.webp" alt="Inter-house sports" className="aspect-[4/3] w-full" />
          </Item>
          <div>
            <Reveal>
              <h2 className="font-serif text-3xl">Four houses, one healthy rivalry</h2>
              <div className="mt-6 grid grid-cols-2 gap-3">
                {[
                  ["Gold House", "#C9A24B"],
                  ["Emerald House", "#0E7C5B"],
                  ["Sky House", "#16407A"],
                  ["Ruby House", "#C2410C"],
                ].map(([h, c]) => (
                  <div key={h} className="flex items-center gap-3 rounded-xl border border-ivory-100/10 bg-navy-800 p-4">
                    <span className="h-4 w-4 rounded-full" style={{ background: c }} aria-hidden />
                    {h}
                  </div>
                ))}
              </div>
              <p className="mt-6 text-ivory-100/70">
                Houses compete in sports, quiz, drama and neatness through the year — the cup is presented on the
                last day of the session.
              </p>
            </Reveal>
          </div>
        </div>
      </Section>

      {/* Cultural day */}
      <section className="bg-ivory-100 py-24 text-navy-950">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 md:grid-cols-2">
          <Reveal>
            <h2 className="font-serif text-3xl md:text-4xl">Cultural day</h2>
            <p className="mt-4 opacity-75">
              Once a session the whole school comes out in Yoruba attíré and dresses from across Nigeria — drumming,
              dance, ewa agoyin, and a debate in Yoruba that gets seriously competitive.
            </p>
          </Reveal>
          <ImageReveal src="/images/assembly.webp" alt="Cultural day assembly" className="aspect-[4/3] w-full" />
        </div>
      </section>
    </main>
  );
}
