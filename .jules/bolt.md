## 2024-04-09 - WeakMap Caching for React State References
**Learning:** `computeTable` in `src/utils/helpers.js` was a performance bottleneck because `getLiveStandings` called it repeatedly on every re-render of `Phase2.jsx` across all 12 groups, even if a group's matches hadn't changed.
**Action:** Since `matches` state is handled immutably in this React codebase, we can use a module-level `WeakMap` in `helpers.js` to cache expensive calculations using the `matches` array as the reference key.
