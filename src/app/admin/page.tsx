import { prisma } from "@/lib/db";
import { requireStaff } from "@/lib/guards";
import { TransitionLink } from "@/components/motion/PageTransition";

export const dynamic = "force-dynamic";

export default async function AdminOverview() {
  const session = await requireStaff();
  const [newApps, totalApps, unread, posts, staffCount] = await Promise.all([
    prisma.admissionApplication.count({ where: { status: "NEW" } }),
    prisma.admissionApplication.count(),
    prisma.contactMessage.count({ where: { handled: false } }),
    prisma.newsPost.count(),
    prisma.staffProfile.count(),
  ]);
  const recent = await prisma.admissionApplication.findMany({ orderBy: { createdAt: "desc" }, take: 5 });
  const messages = await prisma.contactMessage.findMany({ where: { handled: false }, orderBy: { createdAt: "desc" }, take: 3 });

  const cards = [
    { label: "New applications", value: newApps, href: "/admin/applications" },
    { label: "Total applications", value: totalApps, href: "/admin/applications" },
    { label: "Unread messages", value: unread, href: "/admin/inbox" },
    { label: "Published posts", value: posts, href: "/admin/news" },
    { label: "Staff accounts", value: staffCount, href: session.role === "SUPER_ADMIN" ? "/admin/users" : "/admin" },
  ];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-serif text-3xl">Good day, {session.name.split(" ")[0]}</h1>
        <p className="mt-1 text-ivory-100/60">Here's what needs your attention today.</p>
      </header>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        {cards.map((c) => (
          <TransitionLink key={c.label} href={c.href} className="rounded-2xl border border-ivory-100/10 bg-navy-800/60 p-5 transition hover:border-gold-500">
            <p className="font-serif text-4xl text-gold-500 tabular">{c.value}</p>
            <p className="mt-1 text-sm text-ivory-100/60">{c.label}</p>
          </TransitionLink>
        ))}
      </div>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-ivory-100/10 bg-navy-800/60 p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl">Latest applications</h2>
            <TransitionLink href="/admin/applications" className="text-sm text-gold-500">View all →</TransitionLink>
          </div>
          <ul className="mt-4 divide-y divide-ivory-100/10">
            {recent.map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium">{a.childName}</p>
                  <p className="text-xs text-ivory-100/50">{a.level} · {a.reference}</p>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs ${a.status === "NEW" ? "bg-gold-500/15 text-gold-500" : "bg-ivory-100/10 text-ivory-100/60"}`}>
                  {a.status}
                </span>
              </li>
            ))}
            {recent.length === 0 && <li className="py-3 text-sm text-ivory-100/50">No applications yet — they'll appear here the moment a parent applies.</li>}
          </ul>
        </div>

        <div className="rounded-2xl border border-ivory-100/10 bg-navy-800/60 p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl">Unread messages</h2>
            <TransitionLink href="/admin/inbox" className="text-sm text-gold-500">Open inbox →</TransitionLink>
          </div>
          <ul className="mt-4 divide-y divide-ivory-100/10">
            {messages.map((m) => (
              <li key={m.id} className="py-3 text-sm">
                <p className="font-medium">{m.subject}</p>
                <p className="truncate text-xs text-ivory-100/50">{m.name} · {m.message.slice(0, 60)}…</p>
              </li>
            ))}
            {messages.length === 0 && <li className="py-3 text-sm text-ivory-100/50">Inbox zero. Nice.</li>}
          </ul>
        </div>
      </section>
    </div>
  );
}
