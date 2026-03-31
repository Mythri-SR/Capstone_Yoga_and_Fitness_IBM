# Playwright Automation Framework Architecture (Text Diagram)

```
┌──────────────────────────────────────────────────────────────────┐
│                       playwright.config.js                       │
│   baseURL · Chrome project · reporters: HTML + Allure              │
└──────────────────────────────────────────────────────────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         ▼                       ▼                       ▼
  ┌─────────────┐        ┌──────────────┐       ┌────────────────┐
  │   tests/    │        │   pages/     │       │ utils/fixtures │
  │ *.spec.js   │───────▶│ Page Objects │◀──────│ JSON + helpers │
  └─────────────┘        └──────────────┘       └────────────────┘
         │                       │
         ▼                       ▼
  React (Vite)  ──proxy /api──▶  Express API  ──▶  MySQL

Reporters
---------
- Playwright HTML report → playwright-report/
- allure-playwright → allure-results/ (generate with Allure CLI)

Design choices
--------------
- Page Object Model (Login, Register, Book, BasePage)
- JSON fixtures for seeded users and entity ids
- Eight module specs mirror STLC documentation (8 × 15 scenarios)
- `describe.serial` where flows share mutable booking/review state
```
