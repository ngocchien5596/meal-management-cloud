# Plan: Price Continuity Enforcement

> **Goal:** Ensure no gaps exist between meal price configurations. "Không có ngày nào là không được cấu hình giá."

## 1. Context Analysis
The user has established two conflicting constraints in previous steps, which this plan resolves:
1.  **Constraint A:** `New Price Start Date` must be in the **future** (> Today).
2.  **Constraint B:** `Old Price End Date` must be the **creation date** (Today).
3.  **New Requirement:** No gaps allowed.

**Conflict:**
If a user sets `New Start Date = Day After Tomorrow`:
- `Old Price` ends Today.
- `New Price` starts Day After Tomorrow.
- **Result:** Gap of 1 day (Tomorrow) with no price.

**Resolution:**
To satisfy "No Gaps" AND "Old End = Today", the **New Price Start Date MUST be exactly Tomorrow**.

## 2. Proposed Changes

### Backend (`apps/api`)
- **Modify `POST /api/prices`**:
  - **Validation**: Enforce `startDate` equals `Today + 1 day` (Tomorrow).
  - **Error Message**: "Để đảm bảo tính liên tục, giá mới phải bắt đầu từ ngày mai (do giá cũ kết thúc hôm nay)."
  - **Logic**:
    - `newStartDate = startOfDay(req.body.startDate)`
    - `tomorrow = startOfDay(new Date() + 1 day)`
    - If `newStartDate.getTime() !== tomorrow.getTime()` -> Throw Error.
  - **Auto-Fix (Optional)**: Alternatively, we automatically Set `startDate = Tomorrow` and ignore user input? -> Better to validate and inform user.

### Frontend (`apps/web`)
- **Modify `Price Modal`**:
  - **Default Value**: Set default date to Tomorrow.
  - **Restriction**:
    - Lock the Date Picker to "Tomorrow" when creating a new price (if adhering strictly to this rule).
    - Or Validate on change.

## 3. Verification Plan
1.  **Test Internal Gap**:
    - Try to add a price starting 2 days from now.
    - Expect Error: "Date must be tomorrow".
2.  **Test Continuity**:
    - Add price starting Tomorrow.
    - Verify Old Price ends Today.
    - Verify New Price starts Tomorrow.
    - No gap exists.

## 4. Agent Assignments
- **Backend**: Update `prices.ts` validation.
- **Frontend**: Update `page.tsx` modal logic.
