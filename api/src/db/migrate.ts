import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createSql } from "./client.js";

const root = path.dirname(fileURLToPath(import.meta.url));
const migrationFile = path.resolve(root, "../../drizzle/0001_init.sql");

const sql = createSql();

await sql`
  CREATE TABLE IF NOT EXISTS schema_migrations (
    id TEXT PRIMARY KEY,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )
`;

const applied = await sql<{ id: string }[]>`SELECT id FROM schema_migrations WHERE id = '0001_init'`;
if (applied.length === 0) {
  const body = await readFile(migrationFile, "utf8");
  await sql.unsafe(body);
  await sql`INSERT INTO schema_migrations (id) VALUES ('0001_init')`;
  console.log("Applied 0001_init");
} else {
  console.log("0001_init already applied");
}

await sql.end();
