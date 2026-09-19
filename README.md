# Small

**One small change at a time.**

Small is an application for people who want to change themselves without trying to change everything at once.

The core idea is deliberately restrictive:

> A user starts with only one habit. The next habit is earned through consistency.

Small exists because motivation often makes us think too big. We try to exercise, read, study, sleep earlier, eat better, and become more productive all at once. The result is often not transformation, but overload.

Small takes the opposite approach: **start smaller than you want to.**

## Core belief

> Successful change is built from small actions repeated consistently.

The product should help users:

1. Choose one small change.
2. Focus on that change without adding more.
3. Practice consistency.
4. Recover when they miss.
5. Earn the ability to add another habit only after demonstrating stability.

## Product identity

Small is **not** intended to become a generic habit tracker with unlimited habits, dashboards, and productivity features.

Its constraint is the product.

See:

- [Product Vision](docs/product/vision.md)
- [Product Principles](docs/product/principles.md)
- [Habit Rules](docs/product/habit-rules.md)
- [UI/UX Design System](docs/product/design-system.md)
- [Product Decisions](docs/decisions/README.md)
- [AI Agent Instructions](AGENTS.md)
- [Deployment and Operations](docs/deployment.md)

## Current stage

**Stage: Product foundation / first vertical slice**

The MVP scope and initial architecture are documented in `docs/product/mvp.md` and `docs/architecture.md`. The initial domain module is under `src/domain`.

The repository is the source of truth for Small. Product decisions should be documented here before or alongside implementation.

## Local development

Use Node 22 and npm. Install dependencies with `npm ci`, then run `npm run dev` for the application or `npm test` for the domain tests. CI runs formatting, linting, typechecking, tests, and the production build from the committed lockfile.

With PostgreSQL running, use `npm run db:migrate` to apply migrations and `npm run db:seed` to create the demo account (`demo@small.local` / `small-dev-password`).
