## 2024-05-18 - [Dynamic List Empty States]
**Learning:** When dynamic lists (like search results or filtered views) become empty, screen readers often remain silent, leaving visually impaired users wondering if the action succeeded or the app is broken.
**Action:** Always add `role="status"` to the empty state container element so that screen readers proactively announce the lack of results (e.g., "No se encontraron resultados para...").
