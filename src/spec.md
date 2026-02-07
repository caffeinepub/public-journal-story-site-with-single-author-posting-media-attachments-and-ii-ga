# Specification

## Summary
**Goal:** Create a public single-author journal/story site where the owner can post entries with media, and readers can view free posts publicly while locked posts are gated by Internet Identity and an owner-managed allowlist.

**Planned changes:**
- Build a Motoko backend data model for posts (title/body, timestamps, locked flag) with stable persistence and CRUD APIs restricted to the configured owner principal.
- Add public read APIs for listing posts (pagination) and fetching by id, with backend-enforced gating so locked content is only returned to the owner or authorized principals.
- Implement Internet Identity login/logout in the frontend and locked-post UI states (prompt to sign in; not-authorized messaging for non-allowlisted users).
- Add an owner-only Admin area for creating/editing/deleting posts and managing the allowlist (grant/revoke by principal text).
- Support image/video media attachments on posts in create/edit flows and render attachments on post detail pages, gated the same as locked text.
- Create public pages (Home/feed, Post detail) with responsive navigation and locked indicators.
- Apply a cohesive visual theme/typography system and add basic form validation plus loading/error/empty states across the UI.

**User-visible outcome:** Visitors can browse a feed of posts and read free posts without logging in; locked posts show a sign-in prompt and only become readable (including media) after Internet Identity login if the user is allowlisted. The owner has an Admin area to publish/edit/delete posts and manage who can access locked content.
