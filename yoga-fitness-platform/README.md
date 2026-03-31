# ZenFlow — Yoga & Fitness Capstone (Full Stack + QE)

Full-stack yoga / fitness booking platform with Express + MySQL API, React (Vite, JavaScript) UI, and a Playwright + Allure automation suite aligned to STLC documentation under `docs/qe/`.

## Prerequisites

- Node.js 18+ and npm
- Docker Desktop (for MySQL) **or** a local MySQL 8 instance
- Java 17+ (optional, for Allure CLI reports)

## 1. Database (Docker)

From the repo root:

```bash
docker compose up -d
```

This creates database `yoga_fitness`, user `yogaapp` / password `yogapass`, imports `database/schema.sql` and `database/seed.sql`.

### Seeded credentials (all use password `password`)

| Role   | Email              |
|--------|--------------------|
| Admin  | admin@yoga.com     |
| Trainer| trainer1@yoga.com, trainer2@yoga.com |
| Member | user1@test.com, user2@test.com |

If login fails, re-generate hashes with `bcryptjs` or wipe the Docker volume and `docker compose up -d` again.

## 2. Backend API

```bash
cd backend
cp .env.example .env
npm install
npm start
```

API: `http://localhost:4000` · Health: `http://localhost:4000/health`

## 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

UI: `http://localhost:5173` (proxies `/api` to port 4000).

## 4. Playwright + Allure

Automated tests assume **Chrome only**, **UI flows** (no direct API tests). Start MySQL + API + UI (or let Playwright spawn API/UI — see note below).

```bash
cd playwright
npm install
npx playwright install chromium
npm test
```

### Allure report

```bash
cd playwright
npx allure generate allure-results --clean -o allure-report
npx allure open allure-report
```

(`allure` ships via `npm install` devDependency `allure-commandline`; you can also install the standalone Allure binary.)

### Web server auto-start

`playwright.config.js` tries to run `npm start` in `backend/` and `npm run dev` in `frontend/`. Ensure `backend/.env` exists and MySQL is reachable first; otherwise start services manually and set `reuseExistingServer` via env in the config or run tests with servers already up.

## 5. QA artifacts

- Strategy & plan: `docs/qe/`
- SQL validation samples: `database/crud_validation.sql`
- Framework notes: `playwright/ARCHITECTURE.md`

## Module map (8 × ≥15 scenarios in automation)

1. User management — `playwright/tests/module-01-user-management.spec.js`
2. Trainer discovery — `module-02-*.spec.js`
3. Program catalog — `module-03-*.spec.js`
4. Search & filters — `module-04-*.spec.js`
5. Session booking — `module-05-*.spec.js`
6. Session lifecycle & payments — `module-06-*.spec.js`
7. Reviews — `module-07-*.spec.js`
8. Progress tracking — `module-08-*.spec.js`

## Troubleshooting

- **409 / duplicate booking**: reset DB or cancel bookings in **My sessions**; automation expects fresh seed for parallel slots.
- **Playwright timeouts**: increase `timeout` in `playwright.config.js` on slower machines.
- **CORS**: ensure `CORS_ORIGIN` in `backend/.env` matches the Vite origin (`http://localhost:5173`).
