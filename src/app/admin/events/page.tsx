import { prisma } from "@/lib/db";
import { requireStaff } from "@/lib/guards";
import { createEvent, deleteEvent } from "@/app/admin/actions";
import { EmptyCalendar } from "@/components/motion/EmptyStates";

export const dynamic = "force-dynamic";

export default async function AdminEventsPage() {
  await requireStaff();
  const events = await prisma.event.findMany({ orderBy: { date: "asc" } });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-3xl">Events</h1>
        <p className="mt-1 text-ivory-100/60">Open days, assessments, breaks — shown on the home page and news page.</p>
      </header>

      <form action={createEvent} className="grid gap-3 rounded-2xl border border-ivory-100/10 bg-navy-800/60 p-6 md:grid-cols-3">
        <input name="title" required placeholder="Event title" className="rounded-md border border-ivory-100/20 bg-navy-950 px-3 py-2.5 md:col-span-1" />
        <input name="date" type="date" required className="rounded-md border border-ivory-100/20 bg-navy-950 px-3 py-2.5" />
        <input name="where" placeholder="Where (optional)" className="rounded-md border border-ivory-100/20 bg-navy-950 px-3 py-2.5" />
        <button className="rounded-full bg-gold-500 px-6 py-2.5 font-semibold text-navy-950 md:col-span-1 md:justify-self-start">Add event</button>
      </form>

      <div className="space-y-3">
        {events.map((e) => (
          <div key={e.id} className="flex items-center justify-between gap-3 rounded-2xl border border-ivory-100/10 bg-navy-800/60 p-4">
            <div>
              <p className="font-semibold">{e.title}</p>
              <p className="text-xs text-ivory-100/50">
                {new Date(e.date).toLocaleDateString("en-NG", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                {e.where ? ` · ${e.where}` : ""}
              </p>
            </div>
            <form action={deleteEvent}>
              <input type="hidden" name="id" value={e.id} />
              <button className="rounded-md border border-ember-500/40 px-3 py-1.5 text-sm text-ember-500">Delete</button>
            </form>
          </div>
        ))}
        {events.length === 0 && (
          <EmptyCalendar
            tone="dark"
            className="rounded-2xl border border-ivory-100/10 bg-navy-800/60 py-8"
            caption="Nothing scheduled — add the first event."
          />
        )}
      </div>
    </div>
  );
}
