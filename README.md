# TOEIC 800 Bootcamp

8-week personalized training system: **400 → 800**.

Phase 1 (current): architecture + PostgreSQL schema, migrations, seed, API health.

## Stack

- API: Node.js, Express, TypeScript (strict)
- DB: PostgreSQL 16 + Drizzle ORM
- Frontend: React + Vite + Tailwind (Phase 2)

## Run Phase 1

```bash
docker compose up -d
cd api
copy .env.example .env   # Windows
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

Health: `GET http://localhost:4000/health`  
Schema check: `GET http://localhost:4000/health/db`

```bash
npm test
```

Architecture: `docs/ARCHITECTURE.md`
