# PLAN: Meal Cost Chart Refinement

## Goal
Enhance the `MealCostChart` to display both Total Cost and Average Cost using a dual-axis line chart with clear visual distinctions and abbreviated VNĐ units.

## Proposed Changes

### 📊 Frontend: MealCostChart Component
- **Chart Type**: Switch from `ComposedChart` (Area + Line) to `LineChart` (Line + Line) or keep `ComposedChart` but use only `Line` elements for consistency.
- **Dual Axes**:
  - **Left Y-Axis (Total Cost)**: Display in "Triệu VNĐ" (e.g., `1.5Tr`).
  - **Right Y-Axis (Avg Cost)**: Display in "K VNĐ" (e.g., `25k`).
- **Visual Distinction**:
  - **Total Cost Line**: Blue color, specific dot style.
  - **Avg Cost Line**: Emerald color, distinct dot style (different size or shape).
- **Tooltips**: Update to show both metrics clearly with their respective VNĐ units.

### 🍱 Frontend: Costs Page
- Ensure `chartData` calculation remains correct with `totalCost` and `avgCost`.

## Step-by-Step Implementation

### Phase 1: Planning (COMPLETED)
- [x] Socratic Gate: Confirm dual-axis and unit abbreviations.
- [x] Create `docs/PLAN-meal-cost-refinement.md`.

### Phase 2: Implementation
- [ ] Modify `MealCostChart.tsx`:
    - Update `Line` components for both metrics.
    - Implement custom tick formatters for Y-Axes (`value / 1000000 + 'Tr'` and `value / 1000 + 'k'`).
    - Customize `dot` and `activeDot` props for visual differentiation.
- [ ] Update `CostsPage.tsx` if needed (already mostly done in previous steps).

### Phase 3: Verification
- [ ] Verify Y-axis labels show `Tr` and `k`.
- [ ] Verify both lines are visible and correctly mapped to their respective axes.
- [ ] Verify tooltip accuracy.

## Agent Assignments
- **Frontend Specialist**: Implement chart changes and styling.
- **Orchestrator**: Final verification.
