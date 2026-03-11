# PLAN-clerk-role.md - Implement Clerk (Văn thư) Role (with Ownership)

This plan details the implementation of a new `CLERK` role with specific permissions for Guest Directory and Meal Management, including **ownership-based access control** for guest records.

## 1. Goal Description
Provide a specialized "Văn thư" (Clerk) role that can:
- **Guest Directory**: 
    - Full access to view the list.
    - Create new records.
    - **Edit/Delete ONLY** records they created themselves.
- **Meal Management**:
    - View individual meals and the overall list.
    - Create/Add new guests to aSpecific meal event.
    - **Edit/Delete ONLY** guests they added themselves.
    - **View-only** access to Ingredients, Menu Items, and Staff DS.
    - Restricted from starting or ending meals.

## 2. Proposed Changes

### Database Phase
- **[schema.prisma](file:///g:/Source-code/qlsa/meal-management/apps/api/prisma/schema.prisma)**: 
    - Add `CLERK` to the `Role` enum.
    - Add `createdBy String?` and `creator Employee?` relation to the `GuestDirectory` model.

### Backend API Phase

#### Guest Directory Access (`guest-directory.ts`)
- **GET `/`**: Allow access to `CLERK`.
- **POST `/`**: Save `req.user.employeeId` to `createdBy`.
- **PUT `/:id` & DELETE `/:id`**: 
    - Allow if `user.role` is Admin/HR.
    - For `CLERK`, check if `record.createdBy === user.employeeId`.

#### Meal Management Access (`meals.ts`)
- **GET `/:id`**: Allow `CLERK` to see the full meal detail.
- **POST `/:id/guests`**: Save `req.user.employeeId` to `createdBy`.
- **PATCH `/guests/:id` & DELETE `/guests/:id`**:
    - Allow if `user.role` is Admin/Kitchen.
    - For `CLERK`, check if `guest.createdBy === user.employeeId`.

### Frontend Web Phase

#### Guest Directory UI (`config/guests/page.tsx`)
- Logic to hide/disable "Sửa/Xóa" buttons if `user.role === 'CLERK'` and `item.createdBy !== user.employeeId`.

#### Meal Detail UI (`meals/[id]/guests/page.tsx`)
- Logic to hide/disable "Sửa/Xóa" buttons for guests in the meal if the current user doesn't have ownership (and is not an Admin).

#### Meal Detail Layout (`meals/[id]/layout.tsx`)
- Update `isAdmin` check to allow `CLERK` into the layout but strictly in **Read-only** mode for non-guest tabs.

## 3. Verification Plan

### Manual Verification Steps
1. **Ownership Partitioning**:
    - Create two Clerk accounts: `Clerk A` and `Clerk B`.
    - `Clerk A` creates a Guest named `Guest A`.
    - `Clerk B` logs in.
    - **Expected**: `Clerk B` can see `Guest A` but cannot edit or delete it (buttons hidden or API returns 403).
    - **Expected**: `Clerk B` can create `Guest B` and has full control over it.
2. **Admin Override**:
    - `ADMIN_SYSTEM` logs in.
    - **Expected**: Admin can edit/delete both `Guest A` and `Guest B`.
3. **Meal Guest Management**:
    - Repeat the ownership test within a specific meal's Guest tab.
4. **General Restricted Access**:
    - Log in as `Clerk A`.
    - Try to edit a Menu Item or Ingredient.
    - **Expected**: UI blocks interaction and API prevents the change.
