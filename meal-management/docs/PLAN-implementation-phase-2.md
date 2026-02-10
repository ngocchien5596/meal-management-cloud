# Project Plan: Core Logic Integration & Backend Connection

**Status**: PLANNING
**Phase**: 2 - Implementation & Integration

## 1. Context & Objectives

The UI for the Meal Management system is largely complete (Pixel-perfect implementation). The Backend (`apps/api`) exists with Express/Prisma and has route files corresponding to key features.
The goal is to transition from **UI/Mock Mode** to **Real Data Mode**, strictly following the user's prioritized workflow.

**Priorities:**
1.  **Foundation**: Backend Audit & Auth setup (Real Login/Logout).
2.  **Standardization**: Refactor API client code in `apps/web`.
3.  **Features**: Config -> Accounts -> My QR -> Change Password -> Meals -> Calendar -> Check-in.

## 2. Technical Strategy

### Backend (apps/api)
- **Framework**: Express with TypeScript.
- **ORM**: Prisma (Database access).
- **Auth**: JWT + Bcrypt (Already presents in `auth.ts`, needs verification).
- **Real-time**: Socket.io (Already installed, needs verification for QR/Check-in).

### Frontend (apps/web)
- **State Management**: `zustand` (for Auth/Global state).
- **Data Fetching**: `@tanstack/react-query` (Standard for catching & stale-while-revalidate).
- **HTTP Client**: `axios` (Recommended) or `fetch` wrapper.
- **Strict Typing**: Shared types between API and Web (if monorepo setup allows) or Zod schema validation.

## 3. Implementation Phases

### Phase 1: Foundation & Auth (Critical Path)
**Goal:** A working Login/Logout flow and standardized API Client.
- [ ] **Backend Audit**:
    - [ ] Review `apps/api/src/routes/auth.ts`: Ensure `/login`, `/me`, `/logout`, `/change-password` exist and follow security best practices.
    - [ ] Review `apps/api/prisma/schema.prisma`: Confirm User/Role models support the logic.
- [ ] **Frontend Core**:
    - [ ] Create `apps/web/src/lib/api.ts`: Configured Axios instance (Interceptors for Bearer token, Error handling).
    - [ ] Create `apps/web/src/stores/useAuthStore.ts`: Zustand store for User, Token, Roles.
    - [ ] Update `apps/web/src/app/(auth)/login/page.tsx`: Replace mock login with real API call.

### Phase 2: System Configuration & Accounts (High Priority)
**Goal:** Admin features for System Config & User Management.
- [ ] **System Config (`/config`)**:
    - [ ] Back: Audit `apps/api/src/routes/config.ts`.
    - [ ] Front: Create `useConfig` hooks (React Query). Replace UI mock data.
- [ ] **Account Issuance (`/accounts`)**:
    - [ ] Back: Audit `apps/api/src/routes/accounts.ts` (CRUD Users).
    - [ ] Front: Create `useAccounts` hooks. Connect "Create Account" form to API.

### Phase 3: Personal Features (Mid Priority)
**Goal:** User self-service features.
- [ ] **My QR (`/my-qr`)**:
    - [ ] Back: Endpoint to generate/retrieve user's static QR code.
    - [ ] Front: Fetch QR data from API.
- [ ] **Change Password (`/change-password`)**:
    - [ ] Back: `POST /api/auth/change-password`.
    - [ ] Front: Connect form, handle validation & error states.

### Phase 4: Meal Management (Complex & Real-time)
**Goal:** Core business logic for meals.
- [ ] **Meals List & Detail**:
    - [ ] Back: Audit `apps/api/src/routes/meals.ts`. Ensure endpoints for `GET /meals`, `GET /meals/:id`, `GET /meals/:id/ingredients`, etc.
    - [ ] Front: `useMeals`, `useMealDetail` hooks.
- [ ] **Calendar (`/dashboard`)**:
    - [ ] Back: Endpoint for monthly/weekly meal schedule.
    - [ ] Front: Populate Calendar UI with real schedule data.

### Phase 5: QR Check-in (Real-time)
**Goal:** Live scanning updates.
- [ ] **Socket.io Integration**:
    - [ ] Back: Emit event `checkin_success` when API receives valid scan.
    - [ ] Front: Listen to socket events to update "Latest Check-ins" list in real-time.

## 4. Verification & Refactoring Plan

- **Refactoring**: As we implement each screen, we will:
    - Extract Types to `apps/web/src/types`.
    - Move hardcoded strings/constants to `apps/web/src/constants`.
    - Lint check (`npm run lint`).
- **Testing**:
    - Verify complete flow: Login -> Config -> Create User -> New User Login -> View QR -> Admin View Meal.

---

**Next Step:** Run `/create` to start **Phase 1: Foundation & Auth**.
