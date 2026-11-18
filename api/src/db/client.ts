import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema.js";

export function databaseUrl(): string {
  return process.env.DATABASE_URL ?? "postgres://toeic:toeic@localhost:5432/toeic";
}

export function createSql(url = databaseUrl()) {
  return postgres(url, { max: 10 });
}

export function createDb(sql: ReturnType<typeof postgres>) {
  return drizzle(sql, { schema });
}

export type AppDb = ReturnType<typeof createDb>;
