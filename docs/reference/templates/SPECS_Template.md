# **`Spec: [Ticket Title]`**

**`Ticket ID:`** `[ID from Project Plan, e.g., AUTH-01] Status: [Current Status, e.g., TODO] Last Updated: YYYY-MM-DD Link to Project Plan: [Link to the main PROJECT_PLAN.md]`

> **📋 Spec Size Guidelines:**
> - **For Features (3+ Story Points):** All sections of this template are mandatory.
> - **For Bugs/Small Tasks (1-2 Story Points):** Only these sections are required:
>   - `Problem & Goal` (keep it brief)
>   - `Acceptance Criteria` 
>   - `Technical Plan`
> - **Skip the rest for small tasks** - Don't let process slow you down!

## **`1. Problem & Goal`**

* **`Problem:`** `(What user problem or business need does this ticket address? Why is this work important?)`  
* **`Goal:`** `(What is the desired outcome? What will be possible once this ticket is complete?)`

## **`2. Acceptance Criteria`**

`(This is a checklist of specific, testable conditions that must be met for the ticket to be considered DONE. Each item should be clear and unambiguous.)`

* `[ ] Condition 1: (e.g., User can successfully register with a valid email and password.)`  
* `[ ] Condition 2: (e.g., An error message is displayed if the email is already in use.)`  
* `[ ] Condition 3: (e.g., All new user data is stored correctly in the database according to the defined schema.)`

## **`3. Technical Plan`**

`(This section outlines the proposed implementation. It doesn't need to be exhaustive upfront but should be filled out before development begins.)`

* **`Approach:`** `(High-level summary of the technical approach.)`  
* **`Affected Components:`** `(What parts of the codebase will this touch? e.g., API, database, UI.)`  
* **`New Dependencies:`** `(Are any new libraries or services required?)`  
* **`Database Changes:`** `(Any new tables, columns, or data migrations?)`

## **`4. Feature Boundaries & Impact`**

`(CRITICAL: Define what this ticket owns vs what it shares to prevent cross-feature contamination)`

### **`Owned Resources`** `(Safe to Modify)`
* `[ ] src/features/[feature-name]/* (all feature-specific files)`
* `[ ] components/[FeatureName]Component.tsx`
* `[ ] styles/[feature-name].module.css`
* `[ ] tests/[feature-name]/*`

### **`Shared Dependencies`** `(Constraints Apply)`
* `[ ] utils/validation.ts (READ-ONLY - do not modify)`
* `[ ] styles/global.css (READ-ONLY - use feature-specific styles instead)`
* `[ ] api/client.ts (EXTEND-ONLY - add new methods, don't modify existing)`
* `[ ] components/SharedButton.tsx (EXTEND via composition, don't modify)`

### **`Impact Radius`**
* **`Direct impacts:`** `[List features that will definitely be affected]`
* **`Indirect impacts:`** `[List features that might be affected]`
* **`Required regression tests:`** `[Specific test suites to run]`

### **`Safe Modification Strategy`**
* `[ ] Use CSS modules for all styling (no global styles)`
* `[ ] Clone shared components instead of modifying`
* `[ ] Use feature flags for risky changes`
* `[ ] Create feature-specific utilities instead of modifying shared ones`
* `[ ] Use design tokens: var(--color-primary) not #007bff`

### **`Technical Enforcement`**
* **`Pre-commit hooks:`** `boundary-check, design-token-validation`
* **`CI/CD checks:`** `feature-isolation, regression-suite`
* **`File permissions:`** `Run set-feature-boundaries.sh before starting`

## **`5. Research & References`**

`(A collection of links and notes from the research phase.)`

* `Link to relevant documentation`  
* `(Notes on existing code that can be reused or refactored.)`

## **`6. Open Questions & Notes`**

`(A space for collaboration. Use this section to list any unresolved questions or to jot down notes during development.)`

* **`Question:`** `(e.g., What should the password complexity requirements be?)`  
* **`Note:`** `(e.g., Remember to add logging for failed login attempts.)`
