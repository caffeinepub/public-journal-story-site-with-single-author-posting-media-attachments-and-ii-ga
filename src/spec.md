# Specification

## Summary
**Goal:** Let users click images to expand them inline (no lightbox) in both the public gallery and the admin editor, and make admin upload completion feedback clearly visible and persistent.

**Planned changes:**
- Add inline click-to-expand toggle for images in the Post Detail page attachments section (keep videos unchanged).
- Add inline click-to-expand toggle for images in the Admin post editor media attachment list (keep videos unchanged; keep Remove media flow working in both states).
- Update the admin media uploader to show an explicit, clearly visible “upload complete” success state that remains until the next upload (or explicit clear), while preventing starting another upload during an active upload and keeping progress visible.
- Ensure uploader error states remain clearly visible and are not overwritten by success unless a subsequent upload succeeds.

**User-visible outcome:** In both public and admin views, clicking an image expands/collapses it inline on the page, and admins get an unmissable, persistent confirmation when an upload completes (with clear progress during upload and clear errors on failure).
