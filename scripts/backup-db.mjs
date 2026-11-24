#!/usr/bin/env node
/**
 * Database backup.
 *
 *   npm run db:backup            # local SQLite dev database
 *   npm run db:backup -- prod    # Postgres (Neon) — needs pg_dump on PATH
 *
 * SQLite files are copied into backups/ and the newest 14 copies are kept.
 * For Postgres the script runs pg_dump against DATABASE_URL instead.
 * The DATABASE_URL is read from the environment or from .env.
 */
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, unlinkSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";

const root = process.cwd();

function readEnvFile() {
  const file = join(root, ".env");
  if (!existsSync(file)) return {};
  const out = {};
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (!match) continue;
    out[match[1]] = match[2].replace(/^["']|["']$/g, "");
  }
  return out;
}

const env = { ...readEnvFile(), ...process.env };
const databaseUrl = env.DATABASE_URL || "";

if (!databaseUrl) {
  console.error("DATABASE_URL is not set (checked the environment and .env).");
  process.exit(1);
}

const forcePostgres = process.argv.includes("prod") || process.argv.includes("--prod");
const backupsDir = join(root, "backups");
mkdirSync(backupsDir, { recursive: true });

const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);

if (databaseUrl.startsWith("file:") && !forcePostgres) {
  // Prisma resolves SQLite paths relative to prisma/schema.prisma.
  const relative = databaseUrl.replace(/^file:/, "");
  const source = resolve(root, "prisma", relative);
  if (!existsSync(source)) {
    console.error(`No database file at ${source} — run npm run db:push first.`);
    process.exit(1);
  }
  const target = join(backupsDir, `school-${stamp}.db`);
  copyFileSync(source, target);
  const size = (statSync(target).size / 1024).toFixed(0);
  console.log(`Backed up ${source} → ${target} (${size} KB)`);

  const old = readdirSync(backupsDir)
    .filter((f) => f.startsWith("school-") && f.endsWith(".db"))
    .sort()
    .slice(0, -14);
  for (const f of old) unlinkSync(join(backupsDir, f));
  if (old.length) console.log(`Removed ${old.length} old backup(s); keeping the newest 14.`);
} else {
  const target = join(backupsDir, `school-${stamp}.dump`);
  const result = spawnSync("pg_dump", ["--no-owner", "--no-privileges", "-f", target, databaseUrl], {
    stdio: "inherit",
  });
  if (result.error) {
    console.error(
      `pg_dump is not available (${result.error.message}). Install the Postgres client tools, or ` +
        `download a dump from the Neon dashboard.`
    );
    process.exit(1);
  }
  if (result.status !== 0) process.exit(result.status ?? 1);
  console.log(`Postgres dump written to ${target}`);
  console.log(`Store it somewhere safe — ${dirname(target)} is not committed to git.`);
}
