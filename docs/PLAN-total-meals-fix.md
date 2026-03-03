# Project Plan: Correcting "Tổng suất" KPI Logic

This plan outlines the changes needed to synchronize the "Tổng suất" (Total Meals) KPI calculation between the "Báo cáo tiền ăn" (Meal Summary) and "Báo cáo chi phí" (Ingredient Costs) reports.

## logic: `Tổng suất = Số suất đã ăn + Số suất bỏ lỡ`

## Phase 1: Context & Socratic Gate (Completed)
- **Confirm Goal**: Ensure "Tổng suất" in Costs report includes missed meals.
- **Clarification**: Include guests and vãng lai in "Số suất đã ăn".
- **Impact**: "Đơn giá TB/Suất" must be recalculated using the updated "Tổng suất".

## Phase 2: Backend Implementation (API)
### [reports.ts](file:///g:/Source-code/qlsa/meal-management/apps/api/src/routes/reports.ts)
1.  **Modify `/api/reports/costs` endpoint**:
    - Update `totalMeals` calculation.
    - Currently, it only counts `relevantCheckins`.
    - New calculation: `registrations(notCancelled) + guests + checkins(withoutRegistration)`.
    - missed/skipped component: registrations where no checkin occurred.
2.  **Update `avgCostPerMeal`**:
    - Use the new `totalMeals` as the divisor for `totalIngredientCost`.

## Phase 3: Frontend Implementation
### [reports/costs/page.tsx](file:///g:/Source-code/qlsa/meal-management/apps/web/src/app/(app)/reports/costs/page.tsx)
- Ensure the KPI card "Tổng suất" correctly displays the updated `totalMeals` from the API.

## Phase 4: Verification
1.  **Backend Verification**: Call `/api/reports/costs` and manually verify the sum of registrations, guests, and unregistered checkins.
2.  **Frontend Verification**: Cross-check with "Báo cáo tiền ăn" to ensure "Đã ăn + Bỏ lỡ" equals "Tổng suất" on the Costs page.

## Next Steps
- Implement backend registry count logic.
- Verify updated average cost per meal.
