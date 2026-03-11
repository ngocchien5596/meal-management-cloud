# PLAN: Restricted HR Permissions

HR role should be identical to the `EMPLOYEE` role, plus access to view "Báo cáo tiền ăn" (Meal Money Reports).

## User Review Required
> [!IMPORTANT]
> This is a **RESTRICTIVE** change. HR will LOSE access to:
> - User Account management (view/create/edit/delete/import).
> - Guest Directory management.
> - Manually toggling registration cancellations for others.

## Proposed Changes

### Backend API (`apps/api`)

#### [MODIFY] [accounts.ts](file:///g:/Source-code/qlsa/meal-management/apps/api/src/routes/accounts.ts)
- Remove `HR` from all `authorize(...)` calls (View, Create, Edit, Delete, Import, Export Template).

#### [MODIFY] [guest-directory.ts](file:///g:/Source-code/qlsa/meal-management/apps/api/src/routes/guest-directory.ts)
- Remove `HR` from all `authorize(...)` calls.

#### [MODIFY] [registrations.ts](file:///g:/Source-code/qlsa/meal-management/apps/api/src/routes/registrations.ts)
- Remove `HR` from the `PATCH /:id` route used for toggling cancellations.

#### [MODIFY] [reports.ts](file:///g:/Source-code/qlsa/meal-management/apps/api/src/routes/reports.ts)
- Ensure HR **KEPT** access to `GET /summary` and `GET /export`.
- HR MUST **NOT** have access to `/costs` or `/reviews`.

### Frontend (`apps/web`)

#### [MODIFY] [menu-items.tsx](file:///g:/Source-code/qlsa/meal-management/apps/web/src/lib/constants/menu-items.tsx)
- Update visibility for `config` group: remove `HR` if present.
- Ensure `Reports` (Báo cáo) is visible to `HR`, but sub-items `reports-costs` and `reports-reviews` are **hidden**.
- Note: `reports-summary` is currently visible to everyone if they reach the page, but the parent `reports` is restricted. HR should see only `reports-summary`.

## Verification Plan

### Manual Verification
1. **Login as HR001**:
   - Check sidebar: "Cấp tài khoản" and "Danh bạ khách" should be GONE.
   - Check reports: "Báo cáo tiền ăn" should be VISIBLE.
   - Check reports: "Báo cáo chi phí" and "Báo cáo đánh giá" should be HIDDEN.
   - Try to access restricted routes via URL: should return 403.
   - Verify calendar registration works as a normal employee.
