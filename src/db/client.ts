import "server-only";
import { mkdirSync } from "node:fs";
import path from "node:path";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

/**
 * DATABASE_URL set → Postgres via postgres-js (production, staging).
 * DATABASE_URL empty → embedded PGlite in ./.data (zero-setup local dev).
 * Both expose the same Drizzle query API, so the app is typed against one of them.
 */
export type DB = PostgresJsDatabase<typeof schema>;

const g = globalThis as unknown as { __dcDb?: Promise<DB> };
const migrationsFolder = path.join(process.cwd(), "drizzle");

async function init(): Promise<DB> {
  const url = process.env.DATABASE_URL;
  if (url) {
    const { default: postgres } = await import("postgres");
    const { drizzle } = await import("drizzle-orm/postgres-js");
    const { migrate } = await import("drizzle-orm/postgres-js/migrator");
    const db = drizzle(postgres(url, { max: 10 }), { schema });
    // In production prefer running migrations as a deploy step; this keeps previews simple.
    if (process.env.MIGRATE_ON_BOOT !== "false") await migrate(db, { migrationsFolder });
    return db;
  }
  const { PGlite } = await import("@electric-sql/pglite");
  const { drizzle } = await import("drizzle-orm/pglite");
  const { migrate } = await import("drizzle-orm/pglite/migrator");
  const dir = path.join(process.cwd(), ".data", "pglite");
  mkdirSync(dir, { recursive: true });
  const db = drizzle(new PGlite(dir), { schema });
  await migrate(db, { migrationsFolder });
  return db as unknown as DB;
}

export function getDb(): Promise<DB> {
  // Don't cache a failed init, or one bad boot poisons every later request.
  g.__dcDb ??= init().catch((e) => {
    g.__dcDb = undefined;
    throw e;
  });
  return g.__dcDb;
}
