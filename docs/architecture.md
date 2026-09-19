# Technical Architecture

## Decision

Small will start as a responsive web application with a single deployable service. This keeps the first production release fast to operate while leaving room for a native client later.

## Initial stack

- Next.js with TypeScript for the web application and server endpoints.
- PostgreSQL for durable product data.
- Prisma for schema and migrations.
- Email/password authentication with server-side authorization.
- Vitest for domain tests and Playwright for browser journeys.
- Docker for reproducible local and production environments.
- GitHub Actions for lint, typecheck, test, and build gates.

## Domain model

`User` owns `Habit` records. A `Habit` owns daily `CheckIn` records. The domain service is responsible for active-habit limits, completion counts, recovery state, and unlock eligibility. UI code must not duplicate these rules.

## Production gates

Every change must pass formatting, linting, typechecking, unit tests, integration tests, and a production build. Deployment must run migrations before serving new application code and expose a health endpoint.

## Engineering boundaries

Business rules live in framework-independent domain services. Route handlers validate input, authorize the user, call an application service, and serialize the result. UI code never becomes the source of truth for habit limits, recovery, or unlock eligibility.

The first deployment is provider-agnostic self-hosted Docker. The hosting provider, domain, and email delivery implementation are deployment configuration concerns and must not leak into the domain layer.
