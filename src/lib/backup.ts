import "server-only";
import { prisma } from "@/lib/db";

/**
 * Every table, parents before children, so rows can be inserted in this order
 * and deleted in the reverse order without breaking foreign keys.
 */
const TABLES = [
  "user",
  "classroom",
  "subject",
  "staffProfile",
  "studentProfile",
  "parentProfile",
  "studentParent",
  "teachingAssignment",
  "timetableSlot",
  "attendanceRecord",
  "score",
  "resultSheet",
  "assignment",
  "submission",
  "busRoute",
  "studentTransport",
  "feeStructure",
  "feeInvoice",
  "payment",
  "admissionApplication",
  "newsPost",
  "event",
  "galleryAlbum",
  "photo",
  "announcement",
  "auditLog",
  "settings",
  "contactMessage",
  "newsletterSubscriber",
] as const;

type TableName = (typeof TABLES)[number];

type Delegate = {
  findMany: (args?: Record<string, unknown>) => Promise<Record<string, unknown>[]>;
  createMany: (args: { data: Record<string, unknown>[] }) => Promise<{ count: number }>;
  deleteMany: () => Promise<{ count: number }>;
};

const delegate = (name: TableName, client: unknown = prisma) =>
  (client as Record<string, Delegate>)[name];

export const BACKUP_FORMAT = "temidire-backup";
export const BACKUP_VERSION = 1;

export type BackupFile = {
  format: typeof BACKUP_FORMAT;
  version: number;
  exportedAt: string;
  counts: Partial<Record<TableName, number>>;
  data: Partial<Record<TableName, Record<string, unknown>[]>>;
};

/** Read every table into one JSON-safe object. */
export async function exportDatabase(): Promise<BackupFile> {
  const data: BackupFile["data"] = {};
  const counts: BackupFile["counts"] = {};
  for (const name of TABLES) {
    const rows = await delegate(name).findMany();
    data[name] = rows;
    counts[name] = rows.length;
  }
  return {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    counts,
    data,
  };
}

export class BackupError extends Error {}

function validate(input: unknown): BackupFile {
  if (!input || typeof input !== "object") throw new BackupError("That file is not a backup.");
  const file = input as Partial<BackupFile>;
  if (file.format !== BACKUP_FORMAT) {
    throw new BackupError("That file was not exported from this school system.");
  }
  if (file.version !== BACKUP_VERSION) {
    throw new BackupError(`Unsupported backup version (${String(file.version)}).`);
  }
  if (!file.data || typeof file.data !== "object") throw new BackupError("The backup has no data.");

  for (const name of TABLES) {
    const rows = file.data[name];
    if (rows === undefined) continue;
    if (!Array.isArray(rows) || rows.some((r) => !r || typeof r !== "object")) {
      throw new BackupError(`The "${name}" section of the backup is damaged.`);
    }
  }
  if (!Array.isArray(file.data.user) || file.data.user.length === 0) {
    throw new BackupError("The backup has no user accounts, so signing in would break.");
  }
  return file as BackupFile;
}

/**
 * Replace the database with a backup, in one transaction.
 *
 * If anything fails part-way the transaction rolls back, so a bad or truncated
 * file leaves the current data exactly as it was.
 */
export async function restoreDatabase(input: unknown): Promise<Record<string, number>> {
  const file = validate(input);

  return prisma.$transaction(
    async (tx) => {
      for (const name of [...TABLES].reverse()) {
        await delegate(name, tx).deleteMany();
      }

      const restored: Record<string, number> = {};
      for (const name of TABLES) {
        const rows = file.data[name];
        if (!rows?.length) {
          restored[name] = 0;
          continue;
        }
        const result = await delegate(name, tx).createMany({ data: rows });
        restored[name] = result.count;
      }
      return restored;
    },
    { timeout: 120_000, maxWait: 10_000 },
  );
}
