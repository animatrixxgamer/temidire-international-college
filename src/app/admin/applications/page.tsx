import { prisma } from "@/lib/db";
import { requireStaff } from "@/lib/guards";
import { setApplicationStatus, addApplicationNote } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

const STATUSES = ["NEW", "CONTACTED", "VISITING", "ASSESSMENT", "OFFERED", "ENROLLED", "REJECTED"] as const;

const chip = (s: string) =>
  s === "NEW" ? "bg-gold-500/15 text-gold-500"
  : s === "REJECTED" ? "bg-ember-500/15 text-ember-500"
  : s === "ENROLLED" ? "bg-emerald-600/15 text-emerald-600"
  : "bg-ivory-100/10 text-ivory-100/70";

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireStaff();
  const { status } = await searchParams;
  const filter = STATUSES.includes((status ?? "") as (typeof STATUSES)[number]) ? status : undefined;
  const apps = await prisma.admissionApplication.findMany({
    where: filter ? { status: filter } : undefined,
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-3xl">Admission applications</h1>
        <p className="mt-1 text-ivory-100/60">Move each child through the pipeline as you contact them.</p>
      </header>

      <div className="flex flex-wrap gap-2">
        <a href="/admin/applications" className={`rounded-full px-4 py-1.5 text-sm ${!filter ? "bg-gold-500 text-navy-950 font-semibold" : "bg-navy-800 text-ivory-100/70"}`}>
          All ({apps.length})
        </a>
        {STATUSES.map((s) => (
          <a key={s} href={`/admin/applications?status=${s}`} className={`rounded-full px-4 py-1.5 text-sm ${filter === s ? "bg-gold-500 text-navy-950 font-semibold" : "bg-navy-800 text-ivory-100/70"}`}>
            {s}
          </a>
        ))}
      </div>

      <div className="space-y-4">
        {apps.map((a) => (
          <details key={a.id} className="group rounded-2xl border border-ivory-100/10 bg-navy-800/60 p-5">
            <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold">{a.childName} <span className="ml-2 text-xs font-normal text-ivory-100/50">{a.reference}</span></p>
                <p className="text-sm text-ivory-100/60">{a.level} · Guardian: {a.guardianName} ({a.relationship}) · {a.phone}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${chip(a.status)}`}>{a.status}</span>
            </summary>
            <div className="mt-4 grid gap-4 text-sm md:grid-cols-2">
              <div className="space-y-1 text-ivory-100/75">
                <p><span className="text-ivory-100/50">Date of birth:</span> {a.dateOfBirth}</p>
                <p><span className="text-ivory-100/50">Gender:</span> {a.gender}</p>
                {a.previousSchool && <p><span className="text-ivory-100/50">Previous school:</span> {a.previousSchool}</p>}
                {a.email && <p><span className="text-ivory-100/50">Email:</span> {a.email}</p>}
                <p><span className="text-ivory-100/50">Address:</span> {a.address}</p>
                {a.notes && <p><span className="text-ivory-100/50">Notes:</span> {a.notes}</p>}
                {a.heardVia && <p><span className="text-ivory-100/50">Heard via:</span> {a.heardVia}</p>}
                <p className="text-xs text-ivory-100/40">Applied {new Date(a.createdAt).toLocaleString("en-NG")}</p>
              </div>
              <div className="space-y-3">
                <form action={setApplicationStatus} className="flex flex-wrap gap-2">
                  <input type="hidden" name="id" value={a.id} />
                  <select name="status" defaultValue={a.status} className="rounded-md border border-ivory-100/20 bg-navy-950 px-3 py-2 text-sm">
                    {STATUSES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                  <button className="rounded-md bg-gold-500 px-4 py-2 text-sm font-semibold text-navy-950">Update status</button>
                </form>
                <form action={addApplicationNote} className="space-y-2">
                  <input type="hidden" name="id" value={a.id} />
                  <textarea name="note" rows={2} placeholder="Internal note…" defaultValue={a.adminNote ?? ""} className="w-full rounded-md border border-ivory-100/20 bg-navy-950 px-3 py-2 text-sm" />
                  <button className="rounded-md border border-ivory-100/20 px-4 py-2 text-sm">Save note</button>
                </form>
                {a.phone && (
                  <a href={`https://wa.me/234${a.phone.replace(/^0/, "")}`} target="_blank" rel="noopener noreferrer" className="inline-block text-sm text-emerald-600">
                    WhatsApp guardian →
                  </a>
                )}
              </div>
            </div>
          </details>
        ))}
        {apps.length === 0 && <p className="rounded-2xl border border-ivory-100/10 bg-navy-800/60 p-8 text-center text-ivory-100/50">Nothing here yet.</p>}
      </div>
    </div>
  );
}
