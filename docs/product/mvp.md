# Small MVP

## Goal

Help a person maintain one meaningful habit long enough to earn a second habit.

## MVP user journey

1. Create an account.
2. Choose one habit from a short list or write a custom habit.
3. Define a small, repeatable action and a preferred schedule.
4. Mark today's action done, skipped, or missed.
5. Review the current streak and recent consistency.
6. When the stability rule is met, unlock adding another habit.

## Product rules

- A user may have only one active habit until the unlock condition is met.
- Completing an action is more important than building a perfect streak.
- Missing a day breaks the streak but does not delete history. Two consecutive missed days start recovery.
- Three consecutive completions end recovery; recovery does not replace the unlock threshold.
- The MVP has no skip status: each scheduled day is complete or missed.
- The user can pause or edit the active habit, but cannot bypass the unlock rule.
- The initial unlock rule is 14 scheduled days with at least 10 completions.
- All dates are evaluated in the user's timezone.

## Out of scope for MVP

Social features, public profiles, gamification points, unlimited dashboards, wearable integrations, AI coaching, and paid subscriptions.

## Acceptance criteria

- A new user can reach their first daily check-in in under two minutes.
- Refreshing or reopening the app preserves the habit and check-in state.
- The system prevents a second active habit before unlock.
- A user can recover from a missed day without losing history.
- A user cannot bypass the second-habit lock by editing or archiving a habit.
- A user can pause, archive, and view the history of a habit without deleting its records.
- The core flow is covered by automated tests.
