# Small development instructions

## Working agreement

- Preserve the product constraint: one active habit until stability is earned.
- Put business rules in domain modules with tests before wiring UI behavior.
- Keep changes small, reversible, and production-oriented.
- Do not add features outside the documented MVP without recording a product decision.

## Required checks

Before calling a change complete, run formatting, lint, typecheck, tests, and the production build when the toolchain is available. Update the relevant documentation when behavior or architecture changes.

## CI and E2E safeguards

- Run the cheapest local checks before pushing: `npm run format:check`, `npm run lint`, `npm run typecheck`, `npm test`, and the relevant Playwright test.
- Authenticated E2E API calls must use the browser's authenticated context. Prefer `page.evaluate(() => fetch(...))` for calls made during a browser journey, or explicitly provide a Playwright `storageState` to an API request context. Do not assume a standalone request context contains the page login cookie.
- When an E2E test creates a session in the UI and then calls an API, assert the response status before reading its body. A `401` or `403` must fail with a clear authentication message rather than producing a misleading downstream assertion.
- When a UI action starts an asynchronous save, wait for its success or settled-state indicator before reloading or asserting persistence; do not rely only on the control's optimistic value.
- After fixing a CI failure, add a regression test or a documented prevention rule in the same change when practical.
- Do not push a formatting-only or speculative CI change without running the affected command locally first.
