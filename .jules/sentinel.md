## 2026-04-09 - Prevent Information Leakage and Client-side DoS
**Vulnerability:** User inputs lacked length limits and error catch blocks leaked raw error objects containing stack traces.
**Learning:** Even in frontend apps, massive inputs can cause performance DoS via continuous array filtering, and raw console errors leak execution contexts.
**Prevention:** Always add a reasonable `maxLength` to search inputs and log generic string messages in `catch(e)` blocks instead of the raw error object.
