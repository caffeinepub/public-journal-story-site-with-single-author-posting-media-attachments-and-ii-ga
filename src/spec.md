# Specification

## Summary
**Goal:** Ensure backend posts store correct `createdAt` timestamps on creation and safely migrate existing persisted posts with invalid timestamps (including setting “Backroads Litter” to render as 08 January 2026 in Australia/Sydney).

**Planned changes:**
- Update backend post creation logic to store `createdAt` as the current Unix epoch timestamp in seconds (Nat64) instead of `0`.
- Add an upgrade-safe, conditional canister migration to normalize persisted posts with invalid `createdAt` values to reasonable non-zero epoch-seconds timestamps.
- Include a specific migration correction so the existing post titled “Backroads Litter” has a stored `createdAt` that renders as “08 January 2026” in Australia/Sydney timezone (using existing frontend formatting).

**User-visible outcome:** New posts show today’s date in the UI, and after upgrade existing posts (including “Backroads Litter”) display correct dates on both the home feed and post detail page.
