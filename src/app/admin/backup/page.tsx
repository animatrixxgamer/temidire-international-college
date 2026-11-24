import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireSuperAdmin } from "@/lib/guards";
import { RestoreBackup } from "@/components/admin/RestoreBackup";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Backups" };

export default async function AdminBackupPage() {
  await requireSuperAdmin();

  const [users, students, invoices, payments, messages] = await Promise.all([
    prisma.user.count(),
    prisma.studentProfile.count(),
    prisma.feeInvoice.count(),
    prisma.payment.count(),
    prisma.contactMessage.count(),
  ]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-3xl">Backups</h1>
        <p className="mt-1 max-w-2xl text-ivory-100/60">
          Download a complete copy of the school&apos;s data — accounts, pupils, results,
          fees and payments — as one file. Keep the file somewhere safe and download a
          fresh one before big changes, after exam results are published and at the end
          of each term.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        {[
          { label: "Accounts", value: users },
          { label: "Pupils", value: students },
          { label: "Invoices", value: invoices },
          { label: "Payments", value: payments },
          { label: "Messages", value: messages },
        ].map((c) => (
          <div key={c.label} className="rounded-2xl border border-ivory-100/10 bg-navy-800/60 p-5">
            <p className="font-serif text-2xl text-gold-500 tabular">{c.value}</p>
            <p className="mt-1 text-sm text-ivory-100/60">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-gold-500/25 bg-navy-800/60 p-6">
        <h2 className="font-serif text-xl">Download a backup</h2>
        <p className="mt-2 text-sm text-ivory-100/60">
          The file contains everything above in one JSON document. It includes password
          hashes, so treat it like the school&apos;s keys: keep it private, and do not
          email it around.
        </p>
        <a
          href="/api/admin/backup"
          className="mt-4 inline-block rounded-full bg-gold-500 px-6 py-2.5 font-semibold text-navy-950"
        >
          Download backup file
        </a>
        <p className="mt-4 text-xs text-ivory-100/40">
          If the school hosts on Neon Postgres, Neon also keeps its own automatic
          backups and point-in-time restore under the project&apos;s Backups tab. This
          file is the copy you can keep yourself.
        </p>
      </div>

      <RestoreBackup />

      <p className="text-sm text-ivory-100/50">
        Looking for the online payment log? Payments appear on each invoice in{" "}
        <Link href="/admin/fees" className="text-gold-500 hover:underline">
          Fees
        </Link>
        , including the Paystack reference and the channel used.
      </p>
    </div>
  );
}
