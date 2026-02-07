# Specification

## Summary
**Goal:** Allow an admin/owner to force-update an existing post’s `createdAt` timestamp to the current time and see the change immediately in the Admin UI.

**Planned changes:**
- Add an admin/owner-only backend method in `backend/main.mo` that takes a `postId` and sets that post’s `createdAt` to the current Unix epoch time in seconds (via `Time.now()` and the existing `toUnixSeconds` helper), trapping with “Post not found” when applicable.
- Add a React Query mutation hook in `frontend/src/hooks/useQueries.ts` to call the new backend method and invalidate `['posts']` and `['post', postId]` on success.
- Update `frontend/src/pages/AdminPage.tsx` to include an admin-only control per post to trigger “set date to now”, with English success/error toasts and an updated date shown after refetch.

**User-visible outcome:** In the Admin page, the owner/admin can click a control on a specific post to set its date to “now” and immediately see the updated date reflected in the admin list (and on subsequent loads).
