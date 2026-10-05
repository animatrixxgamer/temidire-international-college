import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth-server";
import type { SessionUser } from "@/lib/auth";

/** Record a sensitive action. Never throws — auditing must not break the request. */
export async function audit(
  action: string,
  opts: { entity?: string; entityId?: string; detail?: string; session?: SessionUser | null } = {}
) {
  try {
    const session = opts.session ?? (await getSession());
    await prisma.auditLog.create({
      data: {
        action,
        entity: opts.entity,
        entityId: opts.entityId,
        detail: opts.detail,
        actorId: session?.id,
        actorName: session?.name ?? "system",
      },
    });
  } catch {
    // swallow — audit must never break the user flow
  }
}
