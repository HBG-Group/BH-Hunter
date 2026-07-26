# Coding Standards — Meino

How we write code here. These keep the project mentoring-quality and maintainable by
sophomore CS students while staying production-safe.

## Files and structure

- **Keep files around 150 lines** when practical; hard ceiling ~200. If a file grows past
  that, split it into reusable modules, components, or hooks.
- **Prefer composition over giant files.** Small, focused units that read top-to-bottom.
- **Respect the layers** (see `ARCHITECTURE.md`): `app/`/`components/` never import Prisma;
  DB access lives only in `lib/db`; view-model shaping lives in `services/`.
- **One responsibility per file.** A component renders; a hook manages client state; a
  service transforms data; a `lib/db` function queries.

## Reuse — never duplicate logic

- If the same logic appears twice, extract a shared helper/component/hook.
- Validation lives in one place (`lib/validation/*` Zod schemas) and is reused by client
  and server. Security primitives live in `lib/security/*` and are reused everywhere.
- Reusable UI goes in `components/ui/*` (e.g. `Skeleton`, `ConfirmDialog`,
  `VerifiedOwnerBadge`). Don't re-implement a card, badge, or dialog inline.

## TypeScript

- **TypeScript always.** No `any`. Type inputs and outputs at layer boundaries.
- Derive types from Prisma/Zod where possible rather than hand-writing duplicates.
- Model the domain with unions/enums that mirror the schema (`STUDENT | OWNER | ADMIN`).

## Mobile-first and accessibility

- **Design for small screens first**, then enhance upward with Tailwind breakpoints.
- Generous touch targets; never hide important actions behind hover only.
- Every interactive element is reachable and labelled: `aria-label`/`aria-pressed`/
  `role` where needed; dialogs trap focus, restore it, and close on Escape.
- Images have `alt`. Respect `prefers-reduced-motion`. Maintain AA colour contrast (the
  muted token is deliberately stone-600 for small text).

## Comments

- **Simple, human comments only.** Explain *why* something exists or a non-obvious
  decision. Keep them short.
- **No AI-generated narration.** Don't restate what the code plainly does. Match the
  surrounding comment density and idiom.

## Security and correctness (never regress)

- Every mutating action: auth guard → Zod validation → rate-limit → scoped DB write.
- Never trust a client-supplied id; verify existence/ownership/status server-side.
- Never trust client file metadata; the bucket + server re-inspection are the real gate.
- User-supplied URLs go through the https allowlist on write and render.
- Errors return a generic message via `guarded`/`reportError`; internals are logged only.
- **Never remove or weaken a security feature** to make something easier.

## UX feedback

- Provide pending/disabled states on every form and action button.
- Skeletons on load, success confirmation after writes, optimistic updates where it helps
  (favorites) with reconciliation to the server truth.

## Workflow

- Run `npx tsc --noEmit`, `npx eslint src`, and `npm run build` — all must pass.
- Verify observable changes in the running app; state honestly what was and wasn't tested.
- **Preserve existing functionality** unless explicitly asked to change it. If a request
  conflicts with the architecture or roadmap, explain the trade-off before acting.
- Update `/context` (especially `TODO.md`) when meaningful facts change.
