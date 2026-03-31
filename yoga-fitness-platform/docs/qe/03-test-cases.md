# Test Case Repository (Summary)

Each module maintains **15 detailed UI scenarios** mirrored in Playwright (`playwright/tests/module-0X-*.spec.js`). Columns below map 1:1 to automation IDs.

## Column legend

| Column | Meaning |
|--------|---------|
| ID | `M{module}-TC{nn}` |
| Type | Positive / Negative / Boundary / Edge |
| Preconditions | Account + data state |

## Module 1 — User management

| ID | Description | Type | Preconditions | Expected |
|----|-------------|------|---------------|----------|
| M1-TC01 | Home renders | Positive | None | Hero + nav |
| M1-TC02 | Open login | Positive | None | `/login` |
| M1-TC03 | Wrong password | Negative | Seed member | Error banner |
| M1-TC04 | Member login | Positive | Seed member | `/dashboard` |
| M1-TC05 | Logout | Positive | Session | Login link returns |
| M1-TC06 | Register form | Positive | Guest | Role select visible |
| M1-TC07 | Short password | Boundary | Guest | Stays on form |
| M1-TC08 | Register member | Positive | Unique email | Token stored |
| M1-TC09 | Register trainer | Positive | Unique email | Trainer role |
| M1-TC10 | Guest dashboard | Negative | Guest | CTA copy |
| M1-TC11 | Trainer login | Positive | Seed trainer | Name in nav |
| M1-TC12 | Invalid email | Negative | Guest | Browser validation |
| M1-TC13 | Duplicate email | Negative | Taken email | API error |
| M1-TC14 | Admin login | Positive | Seed admin | Dashboard |
| M1-TC15 | Guest sessions | Negative | Guest | Prompt |

*(Modules 2–8 follow the same rigor; refer to matching spec files for step-level detail, screenshots, and Allure attachments.)*

## Traceability

| Module | Primary spec file |
|--------|-------------------|
| 2 Trainer discovery | `module-02-trainer-discovery.spec.js` |
| 3 Program catalog | `module-03-program-catalog.spec.js` |
| 4 Search & filters | `module-04-search-filters.spec.js` |
| 5 Booking | `module-05-session-booking.spec.js` |
| 6 Lifecycle / pay | `module-06-session-lifecycle.spec.js` |
| 7 Reviews | `module-07-reviews.spec.js` |
| 8 Progress | `module-08-progress.spec.js` |

> Full tabular export (120 rows × columns: Preconditions, Steps, Data, Expected) can be generated from the spec titles using `npx playwright test --list`.
