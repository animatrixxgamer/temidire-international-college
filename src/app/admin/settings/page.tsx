import { prisma } from "@/lib/db";
import { requireSuperAdmin } from "@/lib/guards";
import { setSetting } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

const KNOWN: Array<[string, string]> = [
  ["current_session", "Current session (e.g. 2026/2027)"],
  ["current_term", "Current term (1, 2 or 3)"],
  ["school_phone", "School phone number"],
  ["school_whatsapp", "WhatsApp number (international, no +)"],
  ["school_email", "School email"],
  ["school_address", "Full street address"],
];

export default async function AdminSettingsPage() {
  await requireSuperAdmin();
  const rows = await prisma.settings.findMany();
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-3xl">Site settings</h1>
        <p className="mt-1 text-ivory-100/60">System-wide values used across the site and portals.</p>
      </header>

      <div className="space-y-3">
        {KNOWN.map(([key, label]) => (
          <form key={key} action={setSetting} className="flex flex-wrap items-center gap-3 rounded-2xl border border-ivory-100/10 bg-navy-800/60 p-4">
            <input type="hidden" name="key" value={key} />
            <label className="w-full text-sm text-ivory-100/70 md:w-72">{label}</label>
            <input
              name="value"
              defaultValue={map[key] ?? ""}
              placeholder="not set"
              className="min-w-48 flex-1 rounded-md border border-ivory-100/20 bg-navy-950 px-3 py-2 text-sm"
            />
            <button className="rounded-md bg-gold-500 px-4 py-2 text-sm font-semibold text-navy-950">Save</button>
          </form>
        ))}
      </div>

      <details className="rounded-2xl border border-ivory-100/10 bg-navy-800/60 p-5">
        <summary className="cursor-pointer text-sm text-ivory-100/60">Advanced: any other setting key</summary>
        <form action={setSetting} className="mt-4 flex flex-wrap gap-3">
          <input name="key" required placeholder="key" className="rounded-md border border-ivory-100/20 bg-navy-950 px-3 py-2 text-sm" />
          <input name="value" placeholder="value" className="flex-1 rounded-md border border-ivory-100/20 bg-navy-950 px-3 py-2 text-sm" />
          <button className="rounded-md bg-gold-500 px-4 py-2 text-sm font-semibold text-navy-950">Save</button>
        </form>
      </details>
    </div>
  );
}
