## 2026-04-09 - [Language Toggle and Search Input Accessibility]
**Learning:** Found that custom language toggle buttons using array mapping ('es', 'en') often lack descriptive labels for screen readers when only the localized abbreviation is displayed.
**Action:** Always ensure dynamic toggle buttons have localized `aria-label`s attached, e.g., 'Cambiar a Español'. Additionally, added defensive `maxLength` properties to search inputs that perform heavy client-side filtering.
