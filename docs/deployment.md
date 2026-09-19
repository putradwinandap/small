# Deployment and Operations

## Local full stack

1. Copy `.env.example` to `.env` and replace the secrets.
2. Run `docker compose up --build`.
3. Open `http://localhost:3000`.
4. Apply demo data with `docker compose exec app npm run db:seed` when needed.

The application container waits for PostgreSQL health, applies committed migrations, and then starts the production server.

The GitHub Actions pipeline also builds the production Docker image on every pull request and push to `main`.

## CI troubleshooting and cost controls

Run these checks locally before pushing:

```sh
npm run format:check
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
```

For authenticated Playwright journeys, browser UI login and browser-originated `fetch` share the same session cookie. A standalone API request context may not share that cookie unless `storageState` is explicitly configured. Use the browser context for API calls that depend on the login performed in the same journey, and assert the response status before parsing response data.

If CI fails, inspect the first failing step and reproduce only that command locally before pushing another commit. Record a new recurring failure mode in `AGENTS.md` or this section together with its prevention rule.

## Production checklist

- Use a unique `AUTH_SECRET` generated outside the repository.
- Set a production `DATABASE_URL` and `NODE_ENV=production`.
- Put the application behind an HTTPS reverse proxy.
- Restrict PostgreSQL access to the application network.
- Configure a domain and TLS renewal.
- Run `npm run db:migrate` before serving a new application image.
- Verify `/api/health`, then verify `/api/health/ready` before performing the login/check-in smoke flow.
- Do not run the demo seed in a production database.

## Backup and rollback

- Take a PostgreSQL dump before every production migration.
- Store backups outside the application host and test restoration regularly.
- Keep the previous application image available until the new health and smoke checks pass.
- Roll back the application image first when the issue is application-only.
- Restore the database only when a migration or data change requires it; record the incident and recovery point.
