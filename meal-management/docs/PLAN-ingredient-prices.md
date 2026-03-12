# PLAN-ingredient-prices.md

## 1. Overview
Implementing a detailed price tracking system for ingredients to visualize cost trends over time.

## 2. Requirements
- **Visualization**: Line chart using Recharts.
- **Granularity**: Detail per meal (no daily averaging).
- **Navigation**: Link from Ingredient Catalog page to a new detail page.
- **Filtering**: Date range filter (default: 1 month ago to current date).

## 3. Architecture & Design

### Backend (@meal/api)
- **New Endpoint**: `GET /api/ingredients/catalog/:id/price-history`
- **Query Logic**: 
  - Filter `Ingredient` by `catalogId`.
  - Filter by `startDate` and `endDate`.
  - Join with `MealEvent` to get `mealDate` and `mealType`.
  - Return raw list of (date, mealType, unitPrice).

### Frontend (@meal/web)
- **New Page**: `/app/(app)/config/ingredients/[id]/page.tsx`
- **Component**: `IngredientPriceChart` (Recharts).
- **Date Filter**: Component with `start_date` and `end_date` inputs.
- **Data Table**: Table showing detailed historical records alongside the chart.

## 4. Task Breakdown

### Phase 1: Backend Development
- [ ] Add route to `ingredients.ts`.
- [ ] Implement Prisma query with joins and date filters.
- [ ] Verify API output with sample data.

### Phase 2: Frontend API & State
- [ ] Update `meals/api.ts` with `getIngredientPriceHistory`.
- [ ] Add `useIngredientPriceHistory` hook in `meals/hooks.ts`.

### Phase 3: UI Components
- [ ] Implement `PriceHistoryChart` using Recharts.
- [ ] Create `DateRangeFilter` component.
- [ ] Build the Ingredient Detail page layout.

### Phase 4: Integration
- [ ] Add navigation icon/button in `config/ingredients/page.tsx` (using `TrendingUp` icon).
- [ ] Handle empty states and loading indicators.

## 5. Verification Checklist

### Functional
- [ ] Navigating to detail page works for all ingredients.
- [ ] Chart displays points for every meal (not averaged).
- [ ] Date filter defaults to last 30 days and updates the chart correctly.
- [ ] Tooltip on chart shows meal date and meal type (Lunch/Dinner).

### Edge Cases
- [ ] Handling ingredients with no history gracefully.
- [ ] Large datasets (6+ months) UI responsiveness.
- [ ] Concurrent meals on the same day showing distinct points.
