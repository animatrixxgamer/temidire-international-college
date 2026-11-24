import { getSession } from "@/lib/auth-server";
import { exportDatabase } from "@/lib/backup";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Download the whole database as one JSON file. Super admin only. */
export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "SUPER_ADMIN") {
    return Response.json({ error: "Only the owner can download a backup." }, { status: 403 });
  }

  let backup;
  try {
    backup = await exportDatabase();
  } catch (error) {
    console.error("Backup export failed:", error);
    return Response.json({ error: "Could not read the database." }, { status: 500 });
  }

  const stamp = backup.exportedAt.replace(/[:.]/g, "-").slice(0, 19);
  return new Response(JSON.stringify(backup, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="temidire-backup-${stamp}.json"`,
      "Cache-Control": "no-store",
    },
  });
}
