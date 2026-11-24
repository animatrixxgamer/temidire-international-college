import type { Metadata } from "next";
import { Reveal, ImageReveal, SplitHeading } from "@/components/motion/primitives";
import { leadership, staff as fallbackStaff } from "@/content/siteContent";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
  title: "Leadership & staff",
  description: "The management team and teachers of Temidire International College, Ondo.",
};

export const dynamic = "force-dynamic";

type DirectoryEntry = {
  id: string;
  name: string;
  role: string;
  bio: string | null;
};

/** Titles come from /admin/staff; the static list is only a fallback. */
async function getStaffDirectory(): Promise<DirectoryEntry[]> {
  try {
    const profiles = await prisma.staffProfile.findMany({
      where: { user: { active: true } },
      select: {
        id: true,
        title: true,
        roleTitle: true,
        bio: true,
        user: { select: { name: true, role: true } },
        classTeacherOf: { select: { name: true } },
      },
      orderBy: { staffNo: "asc" },
    });
    return profiles.map((p) => ({
      id: p.id,
      name: p.title && !p.user.name.startsWith(p.title) ? `${p.title} ${p.user.name}` : p.user.name,
      role:
        p.roleTitle ??
        (p.classTeacherOf
          ? `Class Teacher, ${p.classTeacherOf.name}`
          : p.user.role.toLowerCase().replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())),
      bio: p.bio,
    }));
  } catch {
    return []; // DB unreachable — the static list still renders
  }
}

/** "Mrs. Titilayo Bamidele" → "TB"; honorifics are skipped. */
function initials(name: string) {
  const parts = name.split(" ").filter((w) => w && !/^(mr|mrs|miss|ms|dr)\.?$/i.test(w));
  return (parts.length ? parts : name.split(" ")).map((w) => w[0]).slice(0, 2).join("");
}

export default async function LeadershipPage() {
  const entries = await getStaffDirectory();
  const usingFallback = entries.length === 0;
  const people: DirectoryEntry[] = usingFallback
    ? fallbackStaff.map((s) => ({ id: s.name, name: s.name, role: s.role, bio: null }))
    : entries;

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
            <h2 className="font-serif text-3xl">Our staff & class teachers</h2>
            <p className="mt-2 opacity-70">Every class has a dedicated class teacher who knows each child by name.</p>
          </Reveal>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {people.map((s, i) => (
              <Reveal key={s.id} delay={i * 0.05}>
                <li className="flex items-center gap-4 rounded-xl border border-navy-950/10 bg-white/60 p-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-navy-950 font-serif text-lg text-gold-500">
                    {initials(s.name)}
                  </span>
                  <div>
                    <p className="font-semibold">{s.name}</p>
                    <p className="text-sm opacity-70">{s.role}</p>
                    {s.bio && <p className="mt-1 text-sm opacity-60">{s.bio}</p>}
                  </div>
                </li>
              </Reveal>
            ))}
          </ul>
          {usingFallback && (
            <p className="mt-6 text-xs opacity-50">Staff list is placeholder — confirm with the school office.</p>
          )}
        </div>
      </section>
    </main>
  );
}
