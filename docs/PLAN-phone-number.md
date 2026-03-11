# PLAN: Phone Number Integration & 'Not Checked-in' Tab

## 1. Goal Description
Add a `phoneNumber` field across the system to track contact information for both employees and guests. This also includes adding a "Chưa checkin" (Not checked-in) tab in the Meal Detail view to easily identify people who registered but haven't checked in.

## 2. Technical Stack
- **Database**: Prisma ORM, PostgreSQL.
- **Backend**: Express.js, ExcelJS (for import/export), Zod (validation).
- **Frontend**: React, Next.js, TanStack Query.

---

## 3. Proposed Changes

### [Component] Database Schema
- **[MODIFY] [schema.prisma](file:///g:/Source-code/qlsa/meal-management/apps/api/prisma/schema.prisma)**:
    - Add `phoneNumber String?` to `Employee` model.
    - Add `phoneNumber String?` to `Guest` model.
    - Add `phoneNumber String?` to `GuestDirectory` model.
- **Action**: Run `npx prisma migrate dev --name add_phone_number_fields`.

### [Component] Backend APIs
- **[MODIFY] [accounts.ts](file:///g:/Source-code/qlsa/meal-management/apps/api/src/routes/accounts.ts)**:
    - `createAccountSchema`: Add `phoneNumber` (string, optional).
    - `POST /api/accounts`: Save `phoneNumber` during employee creation.
    - `PUT /api/accounts/:id`: Update `phoneNumber`.
    - `GET /api/accounts/template`: Add "Số điện thoại" column (Column G).
    - `POST /api/accounts/import`: Read `phoneNumber` from Column G and save it.
- **[MODIFY] [meals.ts](file:///g:/Source-code/qlsa/meal-management/apps/api/src/routes/meals.ts)**:
    - `POST /api/meals/:id/guests`: Save `phoneNumber`.
    - `PATCH /api/meals/guests/:id`: Update `phoneNumber`.
- **[MODIFY] [guest-directory.ts](file:///g:/Source-code/qlsa/meal-management/apps/api/src/routes/guest-directory.ts)**:
    - Update GET/POST/PATCH to handle `phoneNumber`.

### [Component] Frontend Application
- **[MODIFY] [api.ts](file:///g:/Source-code/qlsa/meal-management/apps/web/src/features/meals/api.ts)**: Add `phoneNumber` to relevant interfaces.
- **[MODIFY] Account Management UI**:
    - Add Phone Number field to "Thêm tài khoản" and "Sửa tài khoản" modals.
- **[MODIFY] Guest Management UI**:
    - Add Phone Number field to the Guest Modal.
    - Add column to the Guest Directory table.
- **[MODIFY] [layout.tsx](file:///g:/Source-code/qlsa/meal-management/apps/web/src/app/(app)/meals/[id]/layout.tsx)**:
    - Add "Chưa checkin" tab.
- **[NEW] [un-checkin/page.tsx](file:///g:/Source-code/qlsa/meal-management/apps/web/src/app/(app)/meals/[id]/un-checkin/page.tsx)**:
    - Implement list of registered employees and guests who have NOT checked in.
    - Display STT, Mã NV/Loại, Họ tên, SĐT.

---

## 4. Verification Plan

### Automated Verification
- Run `npx tsc --noEmit` in both `apps/api` and `apps/web`.
- Verify Prisma schema health.

### Manual Verification
1. **Excel Import**:
   - Download template -> Check "Số điện thoại" column.
   - Fill data -> Import -> Check if SĐT appears in account list.
2. **Guest Flow**:
   - Add a guest with SĐT in a meal.
   - Verify SĐT is saved to Guest and GuestDirectory.
3. **Tab Flow**:
   - Register an employee.
   - Check "Chưa checkin" tab -> Should see them with SĐT.
   - Check in -> Should disappear from "Chưa checkin".
