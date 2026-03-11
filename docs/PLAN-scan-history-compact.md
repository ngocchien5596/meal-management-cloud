# PLAN: Compact Scan History UI

Refactor the Scan Station's check-in history feed into a high-density, minimalist table to maximize the number of visible records.

## Phase 0: Socratic Gate & Analysis

### Clarifications
1. **STT (No.)**: Should this be a simple index (1, 2, 3...) or a unique identifier? -> *Recommendation: Use a descending index based on the list length so the newest scan always has the highest number relative to the current view.*
2. **Employee Info**: Combining ID and Name. Format: `[Code] Full Name`.
3. **Density**: Use `text-xs` (12px) for table content and `py-1` (4px) padding to allow ~20-30 rows to fit without scrolling.

## Phase 1: Data Structure Update
- Update `ScanResult` interface:
  ```typescript
  interface ScanResult {
    // ... existing
    method: 'QR' | 'MANUAL';
  }
  ```
- Ensure `handleScanSuccess` sets `method: 'QR'`.
- Ensure `handleManualSubmit` sets `method: 'MANUAL'`.

## Phase 2: UI Implementation (Minimalist Table)
- Remove `recentScans` card mapping.
- Implement `<table>` with the following columns:
  - **STT**: Count down from total.
  - **Mã NV + Họ tên**: Bold ID, regular Name.
  - **Loại**: Badge-like text ("QR NV" vs "Thủ công").
  - **Thời gian**: HH:mm:ss.
- **Color Palette**:
  - **QR NV**: Emerald-600 (Success).
  - **Thủ công**: Blue-600 (Info/Manual).
  - **Background**: Alternating row colors (Zebra stripes) for readability.

## Phase 3: Verification
- **Test 1**: Perform 5 QR scans. Verify newest at top, color is Emerald.
- **Test 2**: Perform 2 Manual scans. Verify color is Blue.
- **Test 3**: Check responsiveness. Ensure columns don't overflow on smaller screens if the window is resized.

---

## Agent Assignments
- **Antigravity**: Execute `page.tsx` refactor.
- **UI Auditor**: Review contrast and density after implementation.
