# Defect Log — Sample (Derived from Early Test Cycles)

| ID | Title | Severity | Priority | Status | Steps | Expected | Actual |
|----|-------|----------|----------|--------|-------|----------|--------|
| DEF-001 | Double booking allowed | Sev1 | P1 | Fixed | Two members book same slot | 409 error | Previously silent |
| DEF-002 | Pay button after checkout | Sev3 | P3 | Fixed | Complete mock pay | Button hidden | Button lingered |
| DEF-003 | Trainer conflict overlap | Sev2 | P2 | Fixed | Overlapping trainer slots | API blocks | Overlap slipped |
| DEF-004 | Review duplicate not surfaced | Sev3 | P3 | Fixed | Post duplicate review | Validation msg | Generic |
| DEF-005 | Progress streak regression | Sev4 | P4 | Monitoring | Log zero workouts | Streak stable | Stale streak |

## Lifecycle

`New → Assigned → In Progress → Ready for QA → Closed (Verified)` with reopen rules documented in ticketing tool.
