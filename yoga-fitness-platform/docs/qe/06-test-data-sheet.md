# Test Data Sheet

## Accounts

| Name | Email | Password | Role |
|------|-------|----------|------|
| Admin | admin@yoga.com | password | admin |
| Maya | trainer1@yoga.com | password | trainer |
| Jordan | trainer2@yoga.com | password | trainer |
| Alex | user1@test.com | password | member |
| Sam | user2@test.com | password | member |

## Programs / slots (seed)

| Program | ID | Trainer |
|---------|----|---------|
| Sunrise Vinyasa | 1 | Maya (id 2) |
| Deep Stretch | 2 | Maya |
| HIIT Fat Burn | 3 | Jordan (id 3) |
| Power Lifting | 4 | Jordan |

Representative slot ids (see `playwright/fixtures/testData.json` for full list): `12`, `13` (member stress), `14–15` (payments/cancel), `7–8` (reschedule pair).

## Invalid / boundary sets

| Field | Invalid | Boundary |
|-------|---------|----------|
| Password | 7 chars | 8 chars minimum |
| Calories log | negative (blocked by HTML) | 0, 9500, 10000 |
| Rating | n/a in UI | forced via API (1–5) |
| Filters | nonsense combo | min rating 0 / 4.9 |

## Reset instructions

```bash
docker compose down -v
docker compose up -d
```
