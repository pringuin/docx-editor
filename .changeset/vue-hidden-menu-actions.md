---
'@eigenpal/docx-editor-vue': minor
---

Add a `hiddenMenuActions` prop to the Vue `DocxEditor` for hiding individual menu-bar entries by action id (e.g. `['open', 'save', 'reportIssue']`). A top-level menu left with no entries is no longer rendered, and orphaned separators are cleaned up automatically.
