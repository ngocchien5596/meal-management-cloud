# PLAN-meal-price-history

## 1. Goal
Implement a **Time-Based Pricing System** (Price Validity History) for meals.
This ensures that when meal prices increase, the cost of past meals remains calculated based on the historical price effective at that time, rather than the new current price.

## 2. Requirements & Constraints
- **Storage**: Store `price`, `startDate`, and `endDate`.
- **Future Pricing**: Allow setting a price that becomes effective in the future.
- **Continuity**:
    - When a new price is added (e.g., starts `2024-06-01`), the previous price's `endDate` must automatically be closed (e.g., `2024-05-31`).
- **Calculation**: Any meal event must verify its specific date against this history to determine the cost.
- **Migration**: Current `SystemConfig['MEAL_PRICE']` must be migrated to be the "initial" historical record.

## 3. Technical Solution

### 3.1 Database Schema (Prisma)
Create a new model `MealPriceConfig`.

```prisma
model MealPriceConfig {
  id          String    @id @default(uuid())
  price       Float     // The cost per meal
  startDate   DateTime  // Effective from (inclusive)
  endDate     DateTime? // Effective until (inclusive). Null means "until forever"
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  // Index for faster lookups by date
  @@index([startDate, endDate])
}
```

### 3.2 Backend Logic

#### Migration Step (`on-start` or manual script)
1. Check if `MealPriceConfig` is empty.
2. If empty, read `SystemConfig` -> `MEAL_PRICE`.
3. Create entry: `{ price: current_value, startDate: "2020-01-01" (past), endDate: null }`.

#### Create New Price API
**Endpoint**: `POST /api/config/prices`
**Input**: `{ price: number, startDate: string (ISO) }`
**Logic**:
1. Validate `startDate` is in the future (relative to today).
2. Validate `startDate` is after the current active price's `startDate`.
3. **Transaction**:
    - Find current "active" price (where `endDate` is null).
    - Update current active price: Set `endDate` = `new_startDate - 1 day`.
    - Create new record: `{ price: new_price, startDate: new_startDate, endDate: null }`.

#### Cost Calculation Utility
- Create a helper `getMealPrice(date: Date): number`.
- Query: `findFirst({ where: { startDate: { lte: date }, OR: [{ endDate: null }, { endDate: { gte: date } }] } })`.

### 3.3 Frontend (Config Page)
- **View**: Replace the single "Meal Price" input with a **Price History Table**.
    - Columns: Start Date, End Date, Price, Status (Active/Upcoming/Past).
- **Action**: "Add Future Price" button.
    - Modal form: New Price, Start Date.
    - Note: End Date is auto-calculated, so don't ask user for it.

## 4. Work Breakdown

### Phase 1: Database & Migration
- [ ] Define `MealPriceConfig` in `schema.prisma`.
- [ ] Generate migrations (`pnpm prisma migrate dev`).
- [ ] Create seed/migration script to transfer existing `SystemConfig` price.

### Phase 2: Backend Implementation
- [ ] Create `prices` router (`routes/prices.ts`).
- [ ] Implement `GET /` (history) and `POST /` (add new).
- [ ] Implement `getEffectivePrice(date)` helper service.
- [ ] Refactor `reports.ts` (and `meals.ts` if needed) to use `getEffectivePrice()` instead of `MEAL_PRICE` config.
    - *Note*: Report summary calculation needs to be careful. It might need to fetch all prices relevant to the report duration and calculate weighted sums or iterate per day/meal.
    - *Performance*: For monthly reports, fetching all meals and their dates matches well.

### Phase 3: Frontend Implementation
- [ ] Create `usePrices` and `useCreatePrice` hooks.
- [ ] Redesign `apps/web/src/app/(app)/config/page.tsx`:
    - Remove "Card A: Tiền ăn 1 bữa".
    - Add "Price History" section.

### Phase 4: Verification
- [ ] Verify adding a price in the future doesn't change today's meal cost.
- [ ] Verify adding a price updates the previous price's `endDate`.
- [ ] Verify reports calculate correctly across a price change boundary (e.g., half month old price, half month new price).

## 5. Agent Assignment
- **backend-specialist**: Schema, API, Report Logic Refactor.
- **frontend-specialist**: Config Page Redesign.
