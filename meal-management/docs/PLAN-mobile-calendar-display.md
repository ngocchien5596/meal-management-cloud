# Plan: Mobile Calendar Display Improvement

> **Goal**: Fix the overlapping icons issue on the mobile calendar by implementing a responsive layout that switches to a List/Agenda view on small screens.

## User Requirements
-   **Mobile Layout**: Vertical List View (Agenda style).
-   **Icons**: Use **Sun** (☀️) for Lunch and **Moon** (🌙) for Dinner.
-   **Colors**: Strictly follow Desktop color palette (Emerald=Eaten, Rose=Skipped, Blue=Available/Registered).
-   **Constraint**: **Desktop Web Interface MUST remain 100% UNCHANGED.**

## Proposed Changes

### 1. `apps/web/src/app/(app)/dashboard/page.tsx`

#### [MODIFY] `DashboardPage`
-   Implement Strict separation using Tailwind Breakpoints (`md: 768px`).

| Component | Visibility Class | Behavior |
| :--- | :--- | :--- |
| **Old Calendar (Grid)** | `hidden md:grid` | Hidden on mobile. **Identical code/layout** on Desktop. |
| **New Calendar (List)** | `block md:hidden` | Visible only on mobile. |

#### [NEW] `MobileCalendarView` Component
-   **Structure**: Vertical stack of Day items.
-   **Day Item Layout**:
    ```tsx
    <div className="flex items-center justify-between p-4 border-b">
        {/* Left: Date Info */}
        <div className="date-info flex flex-col">
            <span className="text-xl font-black">05</span>
            <span className="text-xs font-bold text-gray-400 uppercase">THỨ 5</span>
        </div>

        {/* Right: Meal Actions */}
        <div className="flex items-center gap-4">
            {/* Lunch Column */}
            <div className="flex flex-col items-center gap-1">
                 <SunIcon className="w-4 h-4 text-orange-500" /> {/* Replaces Text "Trưa" */}
                 <MealActionButton type="lunch" />
            </div>

            {/* Divider */}
            <div className="w-px h-8 bg-gray-100" />

            {/* Dinner Column */}
            <div className="flex flex-col items-center gap-1">
                 <MoonIcon className="w-4 h-4 text-indigo-500" /> {/* Replaces Text "Tối" */}
                 <MealActionButton type="dinner" />
            </div>
        </div>
    </div>
    ```

### 2. Implementation Details
-   Reuse existing `SunIcon` and `MoonIcon` from `dashboard/page.tsx`.
-   Reuse `handleToggle` logic.
-   Ensure `DayCell` logic (colors, states) is adapted for the mobile list row to maintain consistency.

## Verification

### 🛡️ Desktop Preservation Check
1.  Open Dashboard on Desktop (>768px).
2.  **Verify**: The Grid view looks **exactly the same** as before.
3.  **Verify**: No list items or new scrollbars appear.

### Mobile Verification
1.  Open Dashboard on Mobile (<768px).
2.  **Verify**: Grid is hidden. List view is shown.
3.  **Verify**: Icons (Sun/Moon) are used. No overlapping.
