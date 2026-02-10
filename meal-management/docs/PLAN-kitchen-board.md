# PLAN: Kitchen Display Board

## 1. Overview
Create a high-visibility, real-time dashboard for the canteen to display meal information, ingredients, and check-in status to employees.

## 2. User Roles & Access
- **Kitchen Staff**: Opens the board from the Meal Detail page. The route is part of the PROTECTED `(app)` group.
- **Diners**: Observe the board on a physical display (TV/Monitor).
- **Access Control**: Same as Admin/Kitchen staff. Requires login to ensure security and prevent unauthorized external access.

## 3. Core Features
- **Real-time Stats**: Check-in progress updated every 2 seconds.
- **Menu Display**: Today's and Tomorrow's menu preview.
- **Ingredients List**: Full list of all ingredients.
- **Recent Feed**: Animated list of the last 5 check-ins (Full Names).
- **Fallback**: Show "Đang cập nhật..." for missing future data.

## 4. Technical Approach
- **Frontend**: Next.js Page under `(app)/meals/[id]/display`.
- **Styling**: High-contrast Dark Theme (Slate-950/Zinc-900), Large Typography.
- **Data**: TanStack Query with `refetchInterval: 2000`.
- **Display Mode**: Optimized for 1080p/4K TVs in full-screen.

## 5. Task Breakdown
- [ ] Frontend: Create `/meals/[id]/display/page.tsx` with high-contrast UI.
- [ ] Frontend: Implement "Tomorrow's Meal" fetcher with fallback.
- [ ] Frontend: Add "Màn hình TV" button to `MealDetailLayout`.
- [ ] Verification: Test 2s refresh and data sync.

## 6. Verification Checklist
- [ ] Data updates automatically within 2 seconds of a new check-in.
- [ ] Tomorrow's menu displays correctly or shows "Chưa cập nhật" if missing.
- [ ] Layout remains responsive on Large Displays (TVs) and standard monitors.
- [ ] "Recent Feed" correctly distinguishes between Employees and Guests.
