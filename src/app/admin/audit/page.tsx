import { prisma } from "@/lib/db";
import { requireSuperAdmin } from "@/lib/guards";

export const dynamic = "force-dynamic";

export default async function AuditPage() {
  await requireSuperAdmin();
  const logs = await prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 200 });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-3xl">Audit log</h1>
        <p className="mt-1 text-ivory-100/60">Latest 200 sensitive actions — logins, edits, deletions, role changes.</p>
      </header>
      <div className="overflow-x-auto rounded-2xl border border-ivory-100/10 bg-navy-800/60">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-ivory-100/10 text-xs uppercase tracking-wider text-ivory-100/40">
              <th className="px-4 py-3">When</th>
              <th className="px-4 py-3">Actor</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Detail</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l.id} className="border-b border-ivory-100/5">
                <td className="whitespace-nowrap px-4 py-3 text-ivory-100/60">{new Date(l.createdAt).toLocaleString("en-NG")}</td>
                <td className="px-4 py-3">{l.actorName ?? "—"}</td>
                <td className="px-4 py-3"><span className="rounded-full bg-ivory-100/10 px-2 py-0.5 text-xs">{l.action}</span></td>
                <td className="px-4 py-3 text-ivory-100/70">{l.detail ?? l.entity ?? "—"}</td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-ivory-100/40">No activity yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
