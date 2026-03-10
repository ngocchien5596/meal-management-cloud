# PLAN: Minimalist Full-Screen Scan Station

Redesign the Scan Station to be a true standalone page (escaping the main app layout) and adopt a clean, minimalist Viettel branding style without technical clutter.

## Phase 1: Structural Realignment
- Move page from `(app)/meals/[id]/scan-station/page.tsx` to `scan-station/[id]/page.tsx`.
- Update absolute imports and hooks to ensure context works correctly outside the `(app)` group.
- Update navigation in `meals/[id]/layout.tsx`.

## Phase 2: UI Refinement (Viettel Minimalist)
- **Remove Clutter**: Eliminate "CAMERA FEED ACTIVE", "BATCH MODE: ON", and the technical "SYSTEM_ID" overlays.
- **Restructure Right Panel**:
    - Move statistics (Success/Error counts) to the very top of the audit log panel.
    - Simplify labels: "Thành công" and "Thất bại".
    - Clean up the header of the audit log (remove "NHẬT KÝ QUÉT THỜI GIAN THỰC" or simplify it).
- **Camera Viewport**: Keep only the focus frame, remove the scanline animation if it feels too "software-heavy".

## Phase 3: Verification
- Verify camera initialization in root-level route.
- Confirm full-screen behavior (no sidebar/header).
- Test scan feedback (flash/sound) and log persistence.

## Task Breakdown
- [ ] Create `apps/web/src/app/scan-station/[id]/page.tsx`
- [ ] Clean up UI elements (remove râu ria)
- [ ] Relocate and simplify statistics panel
- [ ] Update `apps/web/src/app/(app)/meals/[id]/layout.tsx`
- [ ] Delete old scan-station page
