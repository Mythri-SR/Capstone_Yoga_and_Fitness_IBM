# Test Plan — ZenFlow Platform

## References

- Application: React 18 + Vite (JavaScript), Node 20 + Express, MySQL 8.
- Automation: Playwright Test + allure-playwright (Chrome desktop).

## Scope & Entry Criteria

- MySQL schema applied with seed users/slots (`docker compose up -d`).
- Backend `.env` aligned with compose credentials.
- Frontend `npm run dev` on port 5173 (or Playwright-managed server).

## Exit Criteria

- 120 UI scenarios executed with documented results.
- Critical defects (Sev1/2) resolved or waived with business approval.

## Environment

| Component | URL / Path                |
|-----------|---------------------------|
| UI        | http://localhost:5173     |
| API       | http://localhost:4000     |
| DB        | localhost:3306 (Docker) |

## Schedule (suggested)

1. Manual exploratory smoke (1 hr)
2. Automated Chromium suite (`cd playwright && npm test`)
3. Allure report export for stakeholders
4. SQL validation queries (`database/crud_validation.sql`)

## Roles

- **QE Lead:** owns STLC artifacts.
- **Developers:** reproduce defects, patch API/UI.
- **Product / Trainer SMEs:** approve fitness-domain wording & flows.

## Deliverables

| Phase | Artifact |
|-------|----------|
| Planning | `01-test-strategy.md`, this plan |
| Design | `03-test-cases.md`, `06-test-data-sheet.md` |
| Execution | `04-test-execution-report.md` |
| Closure | `05-defect-log.md`, Allure dashboard |

## Assumptions

- Payment processing is mocked; no PCI compliance testing required.
- Trainer reschedule approvals use in-app buttons only (no email integration).
