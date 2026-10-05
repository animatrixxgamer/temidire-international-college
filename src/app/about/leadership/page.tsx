import type { Metadata } from "next";
import { Reveal, ImageReveal, SplitHeading } from "@/components/motion/primitives";
import { leadership, staff } from "@/content/siteContent";

export const metadata: Metadata = {
  title: "Leadership & staff",
  description: "The management team and teachers of Temidire International College, Ondo.",
};

export default function LeadershipPage() {
  return (
    <main className="pt-16">
      <section className="mx-auto max-w-4xl px-6 pb-12 pt-20 text-center">
        <Reveal>
          <p className="text-sm tracking-wide text-gold-500">Leadership & staff</p>
          <SplitHeading text="The people your child will know" className="mt-3 font-serif text-3xl md:text-5xl" />
        </Reveal>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {leadership.map((p, i) => (
            <Reveal key={p.name} delay={i * 0.07}>
              <div className="group">
                <ImageReveal src={p.photo} alt={p.name} className="aspect-[4/5] w-full" />
                <h2 className="mt-4 font-serif text-xl">{p.name}</h2>
                <p className="text-sm text-gold-500">{p.role}</p>
                <p className="mt-1 text-sm opacity-0 transition-opacity duration-300 group-hover:opacity-70">{p.bio}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-ivory-100 py-20 text-navy-950">
        <div className="mx-auto max-w-4xl px-6">
          <Reveal>
            <h2 className="font-serif text-3xl">Our teachers & class teachers</h2>
            <p className="mt-2 opacity-70">Every class has a dedicated class teacher who knows each child by name.</p>
          </Reveal>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {staff.map((s, i) => (
              <Reveal key={s.name} delay={i * 0.05}>
                <li className="flex items-center gap-4 rounded-xl border border-navy-950/10 bg-white/60 p-4">
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-navy-950 font-serif text-lg text-gold-500">
                    {s.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                  </span>
                  <div>
                    <p className="font-semibold">{s.name}</p>
                    <p className="text-sm opacity-70">{s.role}</p>
                  </div>
                </li>
              </Reveal>
            ))}
          </ul>
          <p className="mt-6 text-xs opacity-50">Staff list is placeholder — confirm with the school office.</p>
        </div>
      </section>
    </main>
  );
}
