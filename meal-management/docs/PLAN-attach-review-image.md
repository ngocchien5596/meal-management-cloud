# PLAN-attach-review-image

**Objective**: Allow users to attach images to meal reviews. Images must be compressed on the client-side to save bandwidth and stored locally on the server.

## 1. Architecture Decisions

*   **Storage**: Local Server File System (`apps/api/uploads/reviews`).
*   **Compression**: Client-side using `browser-image-compression`.
*   **Upload Flow**:
    1.  User selects image -> Client compresses it.
    2.  Client uploads to `POST /api/upload/image`.
    3.  Server saves file -> Returns public URL.
    4.  Client submits Review with the returned URL.

## 2. Component/File Changes

### Backend (`apps/api`)

*   **Dependencies**: Install `multer` (and types).
*   **New Route**: `src/routes/upload.ts`
    *   Endpoint: `POST /upload/image`
    *   Middleware: `multer` configuration (destination, filename, file filter).
*   **Main App**: `src/index.ts`
    *   Mount upload route.
    *   Serve static files from `uploads` folder (e.g., `/static/uploads`).

### Frontend (`apps/web`)

*   **Dependencies**: Install `browser-image-compression`.
*   **New Hook**: `src/features/reviews/hooks/useImageUpload.ts`
    *   `compressImage(file)` function.
    *   `uploadImage(file)` mutation.
*   **UI Update**: `src/features/reviews/components/ReviewModal.tsx`
    *   Replace URL text input with File Input.
    *   Button to trigger file selection (Camera/Image icon).
    *   Preview area for selected/uploaded image.
    *   Loading state during compression/upload.

## 3. Implementation Steps

### Phase 1: Backend Setup
- [ ] Install `multer` and `@types/multer`.
- [ ] Create `apps/api/src/routes/upload.ts` with local storage config.
- [ ] Register route in `index.ts`.
- [ ] Configure `express.static` to serve files from `uploads`.

### Phase 2: Frontend Logic
- [ ] Install `browser-image-compression`.
- [ ] Create `useImageUpload` hook in `features/reviews/hooks`.
- [ ] Implement compression logic (max size 1MB, maxWidth 1920).
- [ ] Implement API call to upload endpoint.

### Phase 3: UI Integration
- [ ] Modify `ReviewModal.tsx`:
    -   Remove: Manual URL Input.
    -   Add: Hidden File Input + Trigger Button.
    -   Add: Image Preview (with "Remove" button).
    -   Logic: On select -> Compress -> Upload -> Set `imageUrl` state.

## 4. Agents & Skills
-   **Backend**: `backend-specialist` (Node.js, Express, Multer).
-   **Frontend**: `frontend-specialist` (React, Image Compression, UI).

## 5. Verification
-   **Client**: Select 5MB image -> Verify uploaded size is < 1MB.
-   **Server**: Check `apps/api/uploads/reviews` for file existence.
-   **Access**: Access image via `http://localhost:4000/static/uploads/...`.
-   **End-to-End**: Create review with image -> Appears on Canteen Board.
