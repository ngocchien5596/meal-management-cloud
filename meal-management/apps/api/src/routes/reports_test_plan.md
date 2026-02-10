
# Test Plan: Reports Functionality

## Goal
Verify that the Reports API correctly calculates "Total Meals", "Skipped", and "Total Cost" under various scenarios (Future, Past, Eaten, Cancelled).

## Scenarios
| ID | Scenario | Registration | Checkin | Date | Expected "Meals" | Expected "Skipped" | Expected "Cost" |
|----|----------|--------------|---------|------|------------------|--------------------|-----------------|
| 1  | Future Meal | Active | No | Future | 1 | 0 | 25,000 |
| 2  | Past Missed | Active | No | Past | 1 | 1 | 25,000 |
| 3  | Past Eaten | Active | Yes | Past | 1 | 0 | 25,000 |
| 4  | Cancelled | Cancelled | No | Future | 0 | 0 | 0 |
| 5  | Cancelled (Late) | Cancelled | No | Past | 0 | 0 | 0 |

## Implementation
1.  **Refactor**: Extract `calculateReportStats` from `apps/api/src/routes/reports.ts` (optional, or just test handler).
2.  **Mocking**: Use `vi.mock` for Prisma.
3.  **Test File**: `apps/api/src/routes/reports.spec.ts`.
