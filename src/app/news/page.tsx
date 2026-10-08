import type { Metadata } from "next";
import { Reveal, SplitHeading } from "@/components/motion/primitives";
import { TransitionLink } from "@/components/motion/PageTransition";
import { prisma } from "@/lib/db";
import { events as fallbackEvents, news as fallbackNews } from "@/content/siteContent";

export const metadata: Metadata = {
  title: "News & events",
  description: "Latest news and upcoming events at Temidire International College, Ondo.",
};

export const dynamic = "force-dynamic";

const fmt = (d: Date) => d.toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" });

export default async function NewsPage() {
  let posts: Array<{ id: string; slug: string; title: string; excerpt: string; createdAt: Date }> = [];
  try {
    posts = await prisma.newsPost.findMany({ where: { published: true }, orderBy: { createdAt: "desc" } });
  } catch { /* fallback below */ }
  if (!posts.length) {
    posts = fallbackNews.map((p) => ({
      id: String(p.id),
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt,
      createdAt: new Date(p.date),
    }));
  }
  let events: Array<{ id: string; title: string; date: Date; where: string | null }> = [];
  try {
    events = await prisma.event.findMany({ where: { published: true, date: { gte: new Date() } }, orderBy: { date: "asc" }, take: 5 });
  } catch { /* ignore */ }
  if (!events.length) events = fallbackEvents.map((e, i) => ({ id: String(i), title: e.title, date: new Date(e.date), where: e.where || null }));

  return (
    <main className="pt-16">
      <section className="mx-auto max-w-4xl px-6 pb-12 pt-20 text-center">
        <Reveal>
          <p className="text-sm tracking-wide text-gold-500">News & events</p>
          <SplitHeading text="Life at Temidire, term by term" className="mt-3 font-serif text-3xl md:text-5xl" />
        </Reveal>
      </section>

      <section className="mx-auto grid max-w-6xl gap-12 px-6 pb-24 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          {posts.map((p, i) => (
            <Reveal key={p.id} delay={i * 0.05}>
              <TransitionLink
                href={`/news/${p.slug}`}
                className="block rounded-2xl border border-ivory-100/12 bg-navy-800/60 p-6 transition hover:border-gold-500"
              >
                <p className="text-sm text-gold-500">{fmt(new Date(p.createdAt))}</p>
                <h2 className="mt-2 font-serif text-2xl">{p.title}</h2>
                <p className="mt-2 text-ivory-100/70">{p.excerpt}</p>
                <p className="mt-4 text-sm font-semibold text-gold-500">Read more →</p>
              </TransitionLink>
            </Reveal>
          ))}
        </div>
        <aside>
          <Reveal>
            <h2 className="font-serif text-2xl">Upcoming events</h2>
            <ul className="mt-6 space-y-4">
              {events.map((e) => (
                <li key={e.id} className="flex gap-4 rounded-2xl border border-ivory-100/12 bg-navy-800/60 p-4">
                  <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-gold-500 text-center text-navy-950">
                    <span className="text-[10px] font-semibold uppercase">{new Date(e.date).toLocaleString("en-NG", { month: "short" })}</span>
                    <span className="font-serif text-xl font-bold leading-none">{new Date(e.date).getDate()}</span>
                  </div>
                  <div>
                    <p className="font-semibold">{e.title}</p>
                    {e.where && <p className="text-sm text-ivory-100/60">{e.where}</p>}
                  </div>
                </li>
              ))}
            </ul>
          </Reveal>
        </aside>
      </section>
    </main>
  );
}
