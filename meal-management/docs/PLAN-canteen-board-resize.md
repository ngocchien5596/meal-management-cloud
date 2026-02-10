# Plan: Canteen Board Resize

**Task:** Resize Canteen Board text/layout elements to prioritize "Meal Code" and "Feedback" visibility.

## User Requirements
1. **Maximize:** Meal Code (QR) and Feedback (Reviews).
2. **Minimize:** Check-in Status, Check-in History, and Menus.

## Current Layout Analysis
- **Main Grid**: 12 Columns.
    - Left Panel: `col-span-8` (66%).
    - Right Panel: `col-span-4` (33%) -> Contains Check-in info.
- **Left Panel Inner Grid**: 12 Columns.
    - QR/Feedback: `col-span-3` (25%).
    - Menus: `col-span-9` (75%).

## Proposed Layout Changes

### 1. Main Container Check-ins (Right Panel)
- **Action**: Shrink from `col-span-4` to `col-span-3`.
- **Reason**: User explicitly asked to make Check-in History smaller.
- **Result**: Right panel takes 25% of screen width. Left panel gains space (becomes `col-span-9` or 75%).

### 2. Left Panel (Menus & Codes)
- **Action**: Expand from `col-span-8` to `col-span-9`.
- **Inner Grid Refactor**:
    - **QR Code / Feedback**: Expand from `col-span-3` to `col-span-5` (approx 42% of Left Panel).
    - **Menus**: Shrink from `col-span-9` to `col-span-7` (approx 58% of Left Panel).

### 3. Visual Adjustments
- **QR Code**: Ensure the image scales up to fill the new width (`w-full aspect-square`).
- **Feedback**: Allow reviews to show more content or larger font since width is increased.
- **Check-in History**: Font sizes might need reduction (`text-[10px]`) to fit in the narrower `col-span-3`.

## File Changes

### [MODIFY] [CanteenBoardContent.tsx](file:///g:/Chientest/meal-management/apps/web/src/features/canteen/components/CanteenBoardContent.tsx)

```tsx
// Main Grid
<div className="col-span-12 lg:col-span-9 ..."> {/* Increased from 8 */}
    {/* Inner Grid */}
    <div className="col-span-5 ..."> {/* QR / Feedback - Increased from 3 */}
    <div className="col-span-7 ..."> {/* Menus - Decreased from 9 */}
</div>

<div className="col-span-12 lg:col-span-3 ..."> {/* Decreased from 4 */}
    {/* Check-in Content */}
</div>
```

## Verification
- Check layout at 1440px (reference resolution).
- Ensure no horizontal scrollbar due to overflow in the narrower Right Panel.
