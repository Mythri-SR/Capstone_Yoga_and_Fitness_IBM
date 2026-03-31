# Test Execution Report — Template

| Field | Value |
|-------|-------|
| Build / commit | `<fill>` |
| Environment | Local Docker / `<env>` |
| Executed by | `<name>` |
| Date | `<YYYY-MM-DD>` |

## Summary

| Metric | Count |
|--------|-------|
| Total automated cases | 120 |
| Passed | `<n>` |
| Failed | `<n>` |
| Blocked | `<n>` |
| Pass % | `<calc>` |

## Notes

- Attach Playwright HTML report (`playwright/playwright-report`).
- Attach Allure report zip (`allure-report/`).
- Link CI job / artifact storage.

## Highlights

- Critical flows exercised: booking, payment mock, reschedule approval, review uniqueness, progress logging.

## Outstanding risks

- Shared DB state when seeds drift — mitigation: `docker compose down -v && up`.
