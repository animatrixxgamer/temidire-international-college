import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { requireStaff } from "@/lib/guards";
import { createAnnouncement, deleteAnnouncement } from "@/app/admin/actions";
import { EmptyState } from "@/components/motion/EmptyStates";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Announcements" };

const AUDIENCES = ["ALL", "STUDENTS", "PARENTS", "STAFF"] as const;

const chip = (a: string) =>
  a === "ALL"
    ? "bg-gold-500/15 text-gold-300"
    : a === "PARENTS"
      ? "bg-emerald-600/15 text-emerald-400"
      : a === "STUDENTS"
        ? "bg-ivory-100/10 text-ivory-100/80"
        : "bg-navy-700/60 text-ivory-100/70";

export default async function AdminAnnouncementsPage() {
  await requireStaff();
  const announcements = await prisma.announcement.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-3xl">Announcements</h1>
        <p className="mt-1 text-ivory-100/60">
          Short notices for the portal. Students and parents see the ones addressed
          to them the next time they sign in.
        </p>
      </header>

      <form action={createAnnouncement} className="space-y-3 rounded-2xl border border-gold-500/25 bg-navy-800/60 p-6">
        <h2 className="font-serif text-xl">New announcement</h2>
        <input
          name="title"
          required
          placeholder="Title (e.g. Mid-term break starts Friday)"
          className="w-full rounded-md border border-ivory-100/20 bg-navy-950 px-3 py-2.5"
        />
        <textarea
          name="body"
          required
          rows={3}
          placeholder="The notice itself…"
          className="w-full rounded-md border border-ivory-100/20 bg-navy-950 px-3 py-2.5"
        />
        <div className="flex flex-wrap items-end gap-3">
          <label className="text-sm text-ivory-100/70">
            Audience
            <select
              name="audience"
              defaultValue="ALL"
              className="mt-1 block w-48 rounded-md border border-ivory-100/20 bg-navy-950 px-3 py-2 text-sm"
            >
              {AUDIENCES.map((a) => (
                <option key={a} value={a}>
                  {a === "ALL" ? "Everyone" : a.charAt(0) + a.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </label>
          <button className="rounded-full bg-gold-500 px-6 py-2.5 font-semibold text-navy-950">
            Post announcement
          </button>
        </div>
      </form>

      <div className="space-y-3">
        {announcements.map((a) => (
          <div key={a.id} className="rounded-2xl border border-ivory-100/10 bg-navy-800/60 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold">{a.title}</p>
                <p className="mt-1 text-sm text-ivory-100/70">{a.body}</p>
                <p className="mt-2 text-xs text-ivory-100/40">
                  Posted {new Date(a.createdAt).toLocaleString("en-NG")}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${chip(a.audience)}`}>
                  {a.audience}
                </span>
                <form action={deleteAnnouncement}>
                  <input type="hidden" name="id" value={a.id} />
                  <button className="rounded-md border border-ember-500/40 px-3 py-1.5 text-sm text-ember-500">
                    Delete
                  </button>
                </form>
              </div>
            </div>
          </div>
        ))}
        {announcements.length === 0 && (
          <EmptyState
            kind="inbox"
            tone="dark"
            className="rounded-2xl border border-ivory-100/10 bg-navy-800/60 py-8"
            caption="No announcements yet — post the first notice."
          />
        )}
      </div>
    </div>
  );
}
