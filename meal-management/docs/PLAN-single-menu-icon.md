# PLAN-single-menu-icon.md

The goal is to simplify the Meal Calendar UI by using a single menu icon per day instead of separate icons for Lunch and Dinner. This icon will open a consolidated modal showing the menu for both meals.

## User Review Required

> [!IMPORTANT]
> - **Icon Placement**: Where is the best spot for the single icon? I'm proposing the top-right corner of the day cell, next to the date number.
> - **Modal Layout**: If both menus exist, they will be shown in two distinct sections (Lunch/Dinner). If only one exists, only that section will be shown.

## Proposed Changes

### [Frontend] Dashboard UI Refactoring

#### [MODIFY] [page.tsx](file:///g:/Source-code/qlsa/meal-management/apps/web/src/app/(app)/dashboard/page.tsx)

- **`MealMenuModal` Component**: 
    - Update props to accept `lunchMenu: MenuItem[]` and `dinnerMenu: MenuItem[]`.
    - Change layout to show two vertical sections with clear "Bữa Trưa" and "Bữa Tối" headers.
- **`DayCell` Component**:
    - Remove the `ScrollTextIcon` from the "Trưa" and "Tối" rows.
    - Add a single `ScrollTextIcon` at the top of the cell (e.g., in the header row next to the day number).
    - Update `onShowMenu` logic: `lunchMenu.length > 0 || dinnerMenu.length > 0` triggers visibility.
- **`MobileDayItem` Component**:
    - Consolidate two icons into one, placed near the date number or beneath the day name.
- **State Management**:
    - Update `activeMenu` state in `DashboardPage` to include both `lunchMenu` and `dinnerMenu` arrays.

## Verification Plan

### Manual Verification
1.  **Icon Presence**: Verify that only one icon appears per day on both Desktop and Mobile.
2.  **Icon Logic**: Verify the icon ONLY appears if at least one menu (Lunch or Dinner) is set for that day.
3.  **Modal Content**: Open the modal for a day with both menus. Verify both sections are visible and clearly labeled.
4.  **Empty State**: Open the modal for a day with only one menu. Verify only the existing menu is shown (or a "no menu" placeholder for the missing one is handled gracefully).
