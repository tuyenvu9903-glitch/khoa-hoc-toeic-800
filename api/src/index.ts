import cors from "cors";
import express from "express";
import { sql } from "drizzle-orm";
import { createDb, createSql, databaseUrl } from "./db/client.js";
import { curriculumWeeks, skills } from "./db/schema.js";

const port = Number(process.env.PORT ?? 4000);
const postgres = createSql();
const db = createDb(postgres);

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "toeic-800-api", phase: 1 });
});

app.get("/health/db", async (_req, res) => {
  try {
    await db.execute(sql`select 1`);
    const skillRows = await db.select({ code: skills.code }).from(skills);
    const weekRows = await db.select({ weekNumber: curriculumWeeks.weekNumber }).from(curriculumWeeks);
    res.json({
      ok: true,
      database: databaseUrl().replace(/:[^:@]+@/, ":***@"),
      skills: skillRows.length,
      weeks: weekRows.length,
    });
  } catch (error) {
    res.status(503).json({
      ok: false,
      error: error instanceof Error ? error.message : "db_unavailable",
    });
  }
});

app.get("/curriculum", async (_req, res) => {
  const weeks = await db.select().from(curriculumWeeks).orderBy(curriculumWeeks.weekNumber);
  res.json({ weeks });
});

app.get("/skills", async (_req, res) => {
  const tree = await db.select().from(skills);
  res.json({ skills: tree });
});

const server = app.listen(port, () => {
  console.log(`TOEIC API phase 1 on http://localhost:${port}`);
});

const shutdown = async () => {
  server.close();
  await postgres.end();
};

process.on("SIGINT", () => {
  void shutdown();
});
process.on("SIGTERM", () => {
  void shutdown();
});
