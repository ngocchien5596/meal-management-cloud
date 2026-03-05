# PLAN-review-image-modal.md

## Context Check
The goal is to improve the image viewing experience in the Review Report. Instead of opening images in a new tab, we will use a responsive Modal that handles single image viewing.

## Socratic Gate Findings
- **Padding on Mobile**: User now wants **Full-screen (Tràn viền)** display to maximize visibility.
- **Swipe Support**: Removed as per user request.
- **Multiple Uploads**: Not currently supported.
- **Download Feature**: Not needed.

## Proposed Changes

### 1. UI Components
- **[MODIFY] [reviews/page.tsx](file:///g:/Source-code/qlsa/meal-management/apps/web/src/app/(app)/reports/reviews/page.tsx)**:
  - Adjust the `Modal` content container to remove padding (`p-0`).
  - Update image styling to fill the modal space while maintaining aspect ratio (`object-contain`).
  - Optional: Use a dark background within the modal for better image contrast.

## Phase 1: Implementation Steps

### Step 1: Update Modal Content
- Modify the `Modal` children in `ReviewsReportPage`.
- Remove the `bg-slate-50/50`, `rounded-3xl`, and `p-2 md:p-6` from the wrapper to achieve the "tràn viền" look.

## Phase 2: Verification

### Manual Verification
- **Mobile**: Verify image touches edges (or is constrained only by the viewport/modal width).
- **Desktop**: Verify the image occupies the full width of the modal.
