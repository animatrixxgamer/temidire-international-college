import { getSession } from "@/lib/auth-server";
import { audit } from "@/lib/audit";
import { BackupError, restoreDatabase } from "@/lib/backup";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 25 * 1024 * 1024;

/**
 * Replace all data with an exported backup file. Super admin only, and only when
 * the request carries the word RESTORE — this is not a button anyone can press by
 * accident. The swap happens in one transaction.
 */
export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "SUPER_ADMIN") {
    return Response.json({ error: "Only the owner can restore a backup." }, { status: 403 });
  }

  const length = Number(req.headers.get("content-length") ?? "0");
  if (length > MAX_BYTES) {
    return Response.json({ error: "That backup is too large (25 MB limit)." }, { status: 413 });
  }

  let body: { confirm?: string; backup?: unknown };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
  if (body.confirm !== "RESTORE") {
    return Response.json({ error: 'Type RESTORE to confirm.' }, { status: 400 });
  }

  try {
    const counts = await restoreDatabase(body.backup);
    await audit("backup.restore", {
      entity: "Database",
      detail: `${counts.user ?? 0} users, ${counts.feeInvoice ?? 0} invoices, ${counts.payment ?? 0} payments`,
      session,
    });
    return Response.json({ ok: true, counts });
  } catch (error) {
    if (error instanceof BackupError) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    console.error("Backup restore failed:", error);
    return Response.json(
      { error: "The restore failed and nothing was changed. The file may be damaged." },
      { status: 500 },
    );
  }
}
