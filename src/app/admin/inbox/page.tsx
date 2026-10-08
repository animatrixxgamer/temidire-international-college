import { prisma } from "@/lib/db";
import { requireStaff } from "@/lib/guards";
import { markMessageHandled } from "@/app/admin/actions";
import { EmptyInbox } from "@/components/motion/EmptyStates";

export const dynamic = "force-dynamic";

export default async function AdminInboxPage() {
  await requireStaff();
  const messages = await prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" } });
  const open = messages.filter((m) => !m.handled);
  const done = messages.filter((m) => m.handled);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-serif text-3xl">Inbox</h1>
        <p className="mt-1 text-ivory-100/60">{open.length} open · {done.length} handled</p>
      </header>

      {[["Open", open], ["Handled", done]].map(([label, list]) => (
        <section key={label as string}>
          <h2 className="font-serif text-xl">{label as string}</h2>
          <div className="mt-3 space-y-3">
            {(list as typeof open).map((m) => (
              <div key={m.id} className={`rounded-2xl border p-5 ${m.handled ? "border-ivory-100/5 bg-navy-800/30 opacity-60" : "border-gold-500/20 bg-navy-800/60"}`}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold">{m.subject}</p>
                  <form action={markMessageHandled}>
                    <input type="hidden" name="id" value={m.id} />
                    <button className="rounded-md border border-ivory-100/20 px-3 py-1.5 text-xs">{m.handled ? "Reopen" : "Mark handled"}</button>
                  </form>
                </div>
                <p className="mt-2 whitespace-pre-line text-sm text-ivory-100/80">{m.message}</p>
                <p className="mt-3 text-xs text-ivory-100/50">
                  {m.name}{m.email ? ` · ${m.email}` : ""}{m.phone ? ` · ${m.phone}` : ""} · {new Date(m.createdAt).toLocaleString("en-NG")}
                </p>
              </div>
            ))}
            {(list as typeof open).length === 0 && (
              <EmptyInbox
                tone="dark"
                className="rounded-2xl border border-ivory-100/10 bg-navy-800/60 py-8"
                caption={label === "Open" ? "No open messages." : "Nothing handled yet."}
              />
            )}
          </div>
        </section>
      ))}
    </div>
  );
}
