# Small development instructions

## Working agreement

- Preserve the product constraint: one active habit until stability is earned.
- Put business rules in domain modules with tests before wiring UI behavior.
- Keep changes small, reversible, and production-oriented.
- Do not add features outside the documented MVP without recording a product decision.

## Required checks

Before calling a change complete, run formatting, lint, typecheck, tests, and the production build when the toolchain is available. Update the relevant documentation when behavior or architecture changes.
