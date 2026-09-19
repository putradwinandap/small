# ADR 0001: Initial application stack

**Status:** Accepted

## Context

The repository is at product-discovery stage and has no implementation stack. Small needs a production-capable first release with a small operational footprint.

## Decision

Use a TypeScript Next.js web application backed by PostgreSQL and Prisma, with Vitest, Playwright, Docker, and GitHub Actions.

## Consequences

This enables one codebase and one deployable service for the MVP. It also means we must keep domain logic independent from React and framework APIs so a future mobile client can reuse the rules.
