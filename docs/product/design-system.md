# Small UI/UX Design System

## Direction

Small should feel calm, focused, warm, and encouraging. The interface should make the next small action obvious without turning consistency into a noisy game.

## Visual tokens

- Ink is the primary text and action color.
- Paper is the default page background.
- Surface is used for cards and elevated content.
- Accent is reserved for progress, status highlights, and primary moments.
- Muted text is used for supporting copy, never for essential instructions.
- Borders are subtle and used to establish grouping.

Spacing uses the shared scale in `src/app/globals.css`. New components must use existing tokens before introducing a new value.

## Typography

- Display headings use the editorial serif face.
- Body copy and controls use the system sans-serif stack.
- Headings are short and calm; avoid all-caps except for small eyebrow labels.
- Body text should remain readable at normal zoom and never carry essential meaning through size alone.

## Components and states

Every interactive component must define default, hover, focus-visible, active, disabled, and error states where applicable. Focus indicators must remain visible for keyboard users.

Buttons use the shared `.button` treatment. Forms must use visible labels, explicit validation messages, and predictable focus order. Progress must be communicated with text as well as visual styling.

## UX rules

- Show one clear next action per screen.
- Explain why a habit is locked or in recovery.
- Never use shame-oriented copy for missed days.
- Preserve user history and make recovery actionable.
- Prefer progressive disclosure over dashboards full of metrics.
- Empty, loading, success, and error states are designed explicitly.
- All flows must work at mobile widths and with keyboard navigation.

## Accessibility baseline

- Semantic HTML first.
- WCAG-oriented contrast for text and controls.
- Visible `:focus-visible` states.
- Respect `prefers-reduced-motion`.
- Do not use color as the only status indicator.
- Every form control has a label and error association.
