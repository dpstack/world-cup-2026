## 2024-04-10 - [Info Leakage Fix] Prevent internal stack trace leakage in error logs
**Vulnerability:** The application was logging raw error objects (`e`) in `catch` blocks (e.g., `console.warn("error", e)`).
**Learning:** This could leak internal application details and stack traces to the client console, creating an information disclosure vulnerability.
**Prevention:** Always log static warning or error messages without appending the raw error object (e.g., `console.warn("error")`). Fail securely.
