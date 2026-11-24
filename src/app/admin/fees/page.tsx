import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { requireStaff } from "@/lib/guards";
import { FINANCE_ROLES } from "@/lib/auth";
import { createInvoice, recordPayment } from "@/app/admin/actions";
import { naira } from "@/content/siteContent";
import { EmptyState } from "@/components/motion/EmptyStates";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Fees" };

const BADGE: Record<string, string> = {
  PAID: "bg-emerald-600/15 text-emerald-400",
  PART: "bg-amber-400/15 text-amber-400",
  PENDING: "bg-ivory-100/10 text-ivory-100/70",
  OVERDUE: "bg-ember-500/15 text-ember-400",
};

export default async function AdminFeesPage() {
  const session = await requireStaff();
  const canRecord = FINANCE_ROLES.includes(session.role);

  const [sessionRow, termRow, students, invoices] = await Promise.all([
    prisma.settings.findUnique({ where: { key: "current_session" } }),
    prisma.settings.findUnique({ where: { key: "current_term" } }),
    prisma.studentProfile.findMany({
      where: { active: true },
      include: {
        user: { select: { name: true } },
        classroom: { select: { name: true } },
      },
      orderBy: { admissionNo: "asc" },
    }),
    prisma.feeInvoice.findMany({
      include: {
        student: { include: { user: { select: { name: true } } } },
      },
      orderBy: { createdAt: "desc" },
      take: 80,
    }),
  ]);

  const yr = sessionRow?.value ?? "2026/2027";
  const term = Number(termRow?.value ?? "1") || 1;

  const billed = invoices.reduce((sum, i) => sum + i.amount, 0);
  const collected = invoices.reduce((sum, i) => sum + i.paidAmount, 0);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-3xl">Fees</h1>
        <p className="mt-1 text-ivory-100/60">
          Bill a pupil for {yr} · Term {term}, then record payments as they arrive at
          the bursary. The portal balance updates immediately.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: "Billed", value: naira(billed) },
          { label: "Collected", value: naira(collected) },
          { label: "Outstanding", value: naira(Math.max(0, billed - collected)) },
          { label: "Invoices", value: String(invoices.length) },
        ].map((c) => (
          <div key={c.label} className="rounded-2xl border border-ivory-100/10 bg-navy-800/60 p-5">
            <p className="font-serif text-2xl text-gold-500 tabular">{c.value}</p>
            <p className="mt-1 text-sm text-ivory-100/60">{c.label}</p>
          </div>
        ))}
      </div>

      {canRecord ? (
        <form
          action={createInvoice}
          className="grid gap-3 rounded-2xl border border-gold-500/25 bg-navy-800/60 p-6 md:grid-cols-4"
        >
          <h2 className="font-serif text-xl md:col-span-4">New invoice</h2>
          <label className="text-sm text-ivory-100/70 md:col-span-2">
            Pupil
            <select
              name="studentId"
              required
              className="mt-1 block w-full rounded-md border border-ivory-100/20 bg-navy-950 px-3 py-2 text-sm"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.user.name} · {s.classroom?.name ?? "Unassigned"} · {s.admissionNo}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm text-ivory-100/70">
            Kind
            <select
              name="kind"
              className="mt-1 block w-full rounded-md border border-ivory-100/20 bg-navy-950 px-3 py-2 text-sm"
            >
              <option value="TUITION">Tuition</option>
              <option value="LEVIES">Levies</option>
              <option value="TRANSPORT">Transport</option>
            </select>
          </label>
          <label className="text-sm text-ivory-100/70">
            Amount (₦)
            <input
              name="amount"
              type="number"
              min={1}
              step={500}
              required
              placeholder="105000"
              className="mt-1 block w-full rounded-md border border-ivory-100/20 bg-navy-950 px-3 py-2 text-sm"
            />
          </label>
          <button className="rounded-full bg-gold-500 px-6 py-2.5 font-semibold text-navy-950 md:col-span-4 md:justify-self-start">
            Create invoice
          </button>
        </form>
      ) : (
        <p className="rounded-2xl border border-ivory-100/10 bg-navy-800/60 p-4 text-sm text-ivory-100/60">
          Only the bursar, administrators and the owner can bill or record payments.
        </p>
      )}

      <div className="space-y-3">
        {invoices.map((i) => {
          const balance = Math.max(0, i.amount - i.paidAmount);
          return (
            <details key={i.id} className="rounded-2xl border border-ivory-100/10 bg-navy-800/60 p-5">
              <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">{i.student.user.name}</p>
                  <p className="text-sm text-ivory-100/60">
                    {i.kind} · {i.session} T{i.term} · billed {naira(i.amount)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-ivory-100/70 tabular">
                    {naira(i.paidAmount)} paid
                  </span>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${BADGE[i.status] ?? BADGE.PENDING}`}>
                    {i.status}
                  </span>
                </div>
              </summary>

              <div className="mt-4 grid gap-3 text-sm md:grid-cols-2">
                <p className="text-ivory-100/60">
                  Balance: <span className="text-ivory-100">{naira(balance)}</span>
                </p>
                {canRecord && balance > 0 && (
                  <form action={recordPayment} className="flex flex-wrap gap-2">
                    <input type="hidden" name="invoiceId" value={i.id} />
                    <input
                      name="amount"
                      type="number"
                      min={1}
                      max={balance}
                      step={500}
                      required
                      defaultValue={balance}
                      placeholder="Amount"
                      className="w-32 rounded-md border border-ivory-100/20 bg-navy-950 px-3 py-2 text-sm"
                    />
                    <select
                      name="method"
                      className="rounded-md border border-ivory-100/20 bg-navy-950 px-3 py-2 text-sm"
                    >
                      <option value="MANUAL">Cash / transfer</option>
                      <option value="PAYSTACK">Paystack</option>
                    </select>
                    <input
                      name="reference"
                      placeholder="Reference (optional)"
                      className="min-w-32 flex-1 rounded-md border border-ivory-100/20 bg-navy-950 px-3 py-2 text-sm"
                    />
                    <button className="rounded-md bg-gold-500 px-4 py-2 text-sm font-semibold text-navy-950">
                      Record payment
                    </button>
                  </form>
                )}
              </div>
            </details>
          );
        })}
        {invoices.length === 0 && (
          <EmptyState
            kind="inbox"
            tone="dark"
            className="rounded-2xl border border-ivory-100/10 bg-navy-800/60 py-8"
            caption="No invoices yet — bill the first pupil above."
          />
        )}
      </div>
    </div>
  );
}
