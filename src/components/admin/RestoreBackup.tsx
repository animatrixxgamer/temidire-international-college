"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Preview = {
  exportedAt?: string;
  users?: number;
  invoices?: number;
  payments?: number;
};

export function RestoreBackup() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [parsed, setParsed] = useState<Record<string, unknown> | null>(null);
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function choose(picked: File | undefined) {
    setFile(picked ?? null);
    setPreview(null);
    setParsed(null);
    setMessage("");
    setError("");
    if (!picked) return;
    try {
      const json = JSON.parse(await picked.text()) as Record<string, unknown>;
      const counts = (json?.counts ?? {}) as Record<string, number>;
      setParsed(json);
      setPreview({
        exportedAt: typeof json?.exportedAt === "string" ? json.exportedAt : undefined,
        users: counts.user,
        invoices: counts.feeInvoice,
        payments: counts.payment,
      });
    } catch {
      setError("That file is not valid JSON.");
    }
  }

  async function submit() {
    if (!parsed) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const res = await fetch("/api/admin/backup/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: "RESTORE", backup: parsed }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "The restore failed.");
      setMessage(
        `Restored ${data.counts?.user ?? 0} users, ${data.counts?.studentProfile ?? 0} pupils and ${data.counts?.payment ?? 0} payments.`,
      );
      setConfirm("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "The restore failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-ember-500/30 bg-ember-500/5 p-6">
      <h2 className="font-serif text-xl">Restore from a backup file</h2>
      <p className="mt-2 text-sm text-ivory-100/60">
        This replaces every account, pupil, invoice and payment with the contents of
        the file. Do it only when you mean to roll the school back. If the file is
        damaged the restore stops and the current data is left untouched.
      </p>

      <label className="mt-4 block text-sm text-ivory-100/70">
        Backup file (.json)
        <input
          type="file"
          accept="application/json,.json"
          onChange={(e) => choose(e.target.files?.[0])}
          className="mt-1 block w-full rounded-md border border-ivory-100/20 bg-navy-950 px-3 py-2 text-sm file:mr-3 file:rounded-full file:border-0 file:bg-gold-500 file:px-3 file:py-1 file:text-navy-950"
        />
      </label>

      {file && preview && (
        <p className="mt-3 text-sm text-ivory-100/60">
          {preview.exportedAt
            ? `Exported ${new Date(preview.exportedAt).toLocaleString("en-NG")}`
            : "Backup file ready"}
          {" · "}
          {preview.users ?? 0} users · {preview.invoices ?? 0} invoices ·{" "}
          {preview.payments ?? 0} payments
        </p>
      )}

      {parsed !== null && (
        <div className="mt-4 space-y-3">
          <label className="block text-sm text-ivory-100/70">
            Type RESTORE to confirm
            <input
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="RESTORE"
              className="mt-1 block w-full rounded-md border border-ivory-100/20 bg-navy-950 px-3 py-2 text-sm"
            />
          </label>
          <button
            type="button"
            onClick={submit}
            disabled={busy || confirm !== "RESTORE"}
            className="rounded-full bg-ember-500 px-6 py-2.5 font-semibold text-white disabled:opacity-50"
          >
            {busy ? "Restoring…" : "Replace all data with this backup"}
          </button>
        </div>
      )}

      {message && <p className="mt-3 text-sm text-emerald-400">{message}</p>}
      {error && <p className="mt-3 text-sm text-ember-400">{error}</p>}
    </div>
  );
}
