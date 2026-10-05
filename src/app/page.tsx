import Hero from "@/components/Hero";
import SchoolSpines from "@/components/SchoolSpines";
import WhyRibbon from "@/components/WhyRibbon";
import Testimonials from "@/components/motion/Testimonials";
import { Marquee, CountUp, Gallery } from "@/components/motion/Extras";
import { Section, Item } from "@/components/motion/SmoothReveal";
import { Reveal, SplitHeading } from "@/components/motion/primitives";
import { TransitionLink } from "@/components/motion/PageTransition";
import { stats, testimonials, galleryImages, events as fallbackEvents, school } from "@/content/siteContent";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

async function getNews() {
  try {
    const rows = await prisma.newsPost.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      take: 4,
    });
    if (rows.length) return rows;
  } catch {
    /* fall through to placeholders */
  }
  return [
    { id: "1", slug: "admissions-open", title: "Admissions open for the 2026/2027 session", excerpt: "Places are available from Creche to SSS 1. Book a visit this month.", createdAt: new Date("2026-10-01") },
    { id: "2", slug: "zonal-quiz", title: "Our JSS 3 team wins the zonal quiz", excerpt: "Five pupils beat 14 schools in Ondo to take the trophy home.", createdAt: new Date("2026-09-22") },
  ];
}

async function getEvents() {
  try {
    const rows = await prisma.event.findMany({
      where: { published: true, date: { gte: new Date() } },
      orderBy: { date: "asc" },
      take: 3,
    });
    if (rows.length) return rows;
  } catch {
    /* ignore */
  }
  return fallbackEvents.map((e, i) => ({ id: String(i), title: e.title, date: new Date(e.date), where: e.where || null }));
}

const fmtDate = (d: Date) =>
  d.toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });

export default async function HomePage() {
  const [news, events] = await Promise.all([getNews(), getEvents()]);
  const [featured, ...rest] = news;

  return (
    <main>
      <Hero />

      {/* Admissions marquee */}
      <div className="border-y border-gold-500/20 bg-navy-950">
        <Marquee items={["Admissions open: 2026/2027", "Creche · Nursery · Primary · Secondary", "Book a campus visit today"]} />
      </div>

      {/* Our four schools — book spines */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <Reveal>
          <p className="text-sm tracking-wide text-gold-500">From six months to sixteen years</p>
          <SplitHeading text="One school for the whole journey" className="mt-2 font-serif text-3xl md:text-5xl" />
        </Reveal>
        <div className="mt-12">
          <SchoolSpines />
        </div>
      </section>

      {/* Why Temidire — ivory */}
      <section className="bg-ivory-100 py-24 text-navy-950">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <p className="text-sm tracking-wide text-navy-700">Why Temidire</p>
            <h2 className="mt-2 font-serif text-3xl md:text-5xl">What we promise your child</h2>
          </Reveal>
          <div className="mt-14">
            <WhyRibbon />
          </div>
        </div>
      </section>

      {/* Numbers band */}
      <Section className="bg-navy-800 py-24" parallax={0}>
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-10 px-6 md:grid-cols-4">
          {stats.map((s) => (
            <Item key={s.label} className="text-center">
              <p className="font-serif text-5xl text-gold-500 md:text-6xl">
                <CountUp to={s.value} suffix={s.suffix} />
              </p>
              <p className="mt-2 text-sm text-ivory-100/70">{s.label}</p>
            </Item>
          ))}
        </div>
      </Section>

      {/* News + events — ivory */}
      <section className="bg-ivory-100 py-24 text-navy-950">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <Reveal>
              <div className="flex items-end justify-between">
                <h2 className="font-serif text-3xl md:text-4xl">Latest news</h2>
                <TransitionLink href="/news" className="text-sm font-semibold text-navy-700 hover:text-gold-600">
                  All news →
                </TransitionLink>
              </div>
            </Reveal>
            {featured && (
              <Reveal delay={0.1}>
                <TransitionLink href={`/news/${featured.slug}`} className="mt-8 block rounded-2xl border border-navy-950/10 bg-white/60 p-8 transition hover:border-gold-500">
                  <p className="text-sm text-navy-700">{fmtDate(new Date(featured.createdAt))}</p>
                  <h3 className="mt-2 font-serif text-2xl md:text-3xl">{featured.title}</h3>
                  <p className="mt-3 opacity-75">{featured.excerpt}</p>
                </TransitionLink>
              </Reveal>
            )}
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {rest.map((n, i) => (
                <Reveal key={n.id} delay={0.1 + i * 0.08}>
                  <TransitionLink href={`/news/${n.slug}`} className="block h-full rounded-2xl border border-navy-950/10 bg-white/60 p-5 transition hover:border-gold-500">
                    <p className="text-xs text-navy-700">{fmtDate(new Date(n.createdAt))}</p>
                    <h4 className="mt-1 font-semibold leading-snug">{n.title}</h4>
                    <p className="mt-2 line-clamp-3 text-sm opacity-70">{n.excerpt}</p>
                  </TransitionLink>
                </Reveal>
              ))}
            </div>
          </div>
          <div>
            <Reveal>
              <h2 className="font-serif text-2xl">Coming up</h2>
              <ul className="mt-6 space-y-4">
                {events.map((e) => (
                  <li key={e.id} className="flex gap-4 rounded-2xl border border-navy-950/10 bg-white/60 p-4">
                    <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-navy-950 text-center text-ivory-100">
                      <span className="text-[10px] uppercase">{new Date(e.date).toLocaleString("en-NG", { month: "short" })}</span>
                      <span className="font-serif text-xl leading-none">{new Date(e.date).getDate()}</span>
                    </div>
                    <div>
                      <p className="font-semibold">{e.title}</p>
                      {e.where && <p className="text-sm opacity-70">{e.where}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-navy-950 py-8">
        <Testimonials items={testimonials} />
      </section>

      {/* Gallery strip */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <Reveal>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-sm tracking-wide text-gold-500">Life at Temidire</p>
              <h2 className="mt-2 font-serif text-3xl md:text-5xl">Around our campus</h2>
            </div>
            <TransitionLink href="/gallery" className="text-sm font-semibold text-gold-500 hover:text-gold-300">
              See the full gallery →
            </TransitionLink>
          </div>
        </Reveal>
        <div className="mt-10">
          <Gallery images={galleryImages.slice(0, 6)} />
        </div>
      </section>

      {/* Closing CTA — gold */}
      <section className="bg-gold-500 py-20 text-navy-950">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <Reveal>
            <h2 className="font-serif text-4xl md:text-5xl">Your child's place is waiting.</h2>
            <p className="mx-auto mt-4 max-w-xl opacity-80">
              Applications for the {school.session} session are open. Apply online in five minutes, or come and see us on an ordinary school day.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <TransitionLink
                href="/admissions/apply"
                className="rounded-full bg-navy-950 px-7 py-3 font-semibold text-ivory-100 transition hover:bg-navy-800"
              >
                Start an application
              </TransitionLink>
              <a
                href={`https://wa.me/${school.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border-2 border-navy-950 px-7 py-3 font-semibold transition hover:bg-navy-950 hover:text-ivory-100"
              >
                Chat on WhatsApp
              </a>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
