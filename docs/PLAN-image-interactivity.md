# PLAN-image-interactivity.md

## Overview
Add image interactivity to the "My Reviews" page, allowing users to hover over thumbnails (showing a pointer cursor) and click to view the image in a full-screen modal.

## Phase 1: Context Check
- **User Request**: Change cursor to pointer on hover and implement full-screen image preview.
- **Affected Page**: `src/app/(app)/reviews/page.tsx`
- **Reused Components**: `src/features/reviews/components/ImagePreviewModal.tsx`

## Phase 2: Implementation Steps
1. **Import `ImagePreviewModal`** in `reviews/page.tsx`.
2. **Define State** for modal visibility and current image URL.
3. **Enhance Table Row `<td>` for Images**:
    - Wrap image thumbnails in a `div` or `button`.
    - Apply `cursor-pointer` to the container.
    - Implement `onClick` to trigger the preview modal.
4. **Integration**: Place the `ImagePreviewModal` component at the bottom of the page.

## Phase 3: Verification Checklist
- [ ] Hovering over a review image changes the cursor to a pointer.
- [ ] Clicking an image opens the `ImagePreviewModal`.
- [ ] Modal displays the correct high-resolution image.
- [ ] Modal closes correctly (X button, backdrop, ESC key).
