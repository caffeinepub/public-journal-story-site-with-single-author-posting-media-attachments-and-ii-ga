# Specification

## Summary
**Goal:** Permanently correct the stored `createdAt` timestamp for the existing “Backroads Litter” post so it displays as 8 January 2026 in the Australia/Sydney timezone.

**Planned changes:**
- Add/adjust backend upgrade migration logic to find the existing post titled “Backroads Litter” and update its persisted `createdAt` to a value that formats to 8 January 2026 in Australia/Sydney.
- Ensure the migration only affects the intended post and preserves all other stored post fields without trapping during upgrade.
- Verify the frontend home feed and post detail page display the corrected date using the existing Sydney date formatter (no changes to general date formatting behavior).

**User-visible outcome:** The “Backroads Litter” post shows the date “8 January 2026” on both the home feed and the post detail page, and this remains correct after deployments/upgrades.
