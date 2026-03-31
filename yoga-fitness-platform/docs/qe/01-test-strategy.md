# Test Strategy — ZenFlow Platform

## Objectives

- Validate role-aware journeys for members, trainers, and admins across booking, payments, reviews, and progress.
- Provide repeatable evidence for STLC phases (planning → design → execution → automation → reporting).
- Keep automation **UI-only on Chromium** per project constraints (no dedicated API/perf/security suites).

## Scope

**In scope:** functional flows, negative paths, boundary inputs exposed via UI, cross-page validation, data displayed from MySQL via API.

**Out of scope:** performance testing, penetration testing, non-Chrome browsers, standalone REST automation.

## Test Levels

| Level        | Focus                                                  | Owner / Tool        |
|-------------|---------------------------------------------------------|---------------------|
| Unit        | Pure functions, validators (future split)              | Dev (Jest optional) |
| Integration | API + DB contracts (manual/API client during dev)      | Dev / QE spot-check |
| System      | End-to-end UI on staging/local Docker                  | Playwright          |
| Regression  | Full Playwright suite on each release candidate        | CI / nightly        |

## Risk Summary

| Risk                              | Mitigation                                      |
|----------------------------------|-------------------------------------------------|
| Slot contention in parallel runs | Seed many slots; serial suites for mutations    |
| Mock payment drift               | Document mock IDs; assert status labels in UI   |
| Trainer timezone ambiguity       | Freeze seed timestamps; assert formatted text   |

## Types & Techniques

- Functional, UI, data validation (via SQL helpers), negative, boundary.
- Techniques: equivalence partitioning (goal/type filters), boundary values (rating, price, calories), decision tables for filter combos.

## Completion Criteria

- 8 modules documented with ≥15 scenarios each (120 total) and matching automation files.
- Playwright green on Chromium with Allure artifacts produced.
