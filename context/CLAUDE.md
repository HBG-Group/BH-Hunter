# Instructions for every Claude Code session on Meino

This file is loaded automatically (the root `CLAUDE.md` imports it). Treat `/context`
as the project's permanent knowledge base — it replaces relying on chat history.

## Before writing any code

1. **Read every file in `/context` first.** Start with `PROJECT_CONTEXT.md`, then the
   file most relevant to your task (`ARCHITECTURE.md`, `SECURITY.md`, etc.).
2. **Understand before changing.** Trace the layer you're touching (UI → hooks →
   services → `lib/db` / `lib/security`). Know where authorization and validation live.
3. **This is Next.js 16 (App Router, Turbopack).** APIs differ from older versions —
   middleware is `proxy.ts`, not `middleware.ts`. Check `node_modules/next/dist/docs/`
   when unsure. Read `AGENTS.md`.

## Non-negotiable rules

- **Never break existing functionality.** If a change would, say so and stop.
- **Never remove or weaken a security feature.** See `SECURITY.md`. Every user write
  stays authorized (`requireOwner` / `requireProfile` / `requireAdmin` + scoped `where`)
  and validated (Zod on the server, not just the client).
- **Maintain accessibility and mobile-first responsiveness.** Both are baseline, not
  extras. See `CODING_STANDARDS.md`.
- **Respect the roadmap and business model.** Phase 1 is free; monetization is scaffolded
  but switched off via `config/billing.ts` (`BILLING_ENABLED = false`). Don't enable it.
- **Keep files ~150 lines** when practical; split reusable logic into hooks/components/
  services rather than growing one file. Prefer composition over giant files.
- **Simple, human comments only.** Explain *why*, briefly. No AI-style narration, no
  restating what the code obviously does.
- **TypeScript always.** No `any`. No duplicated logic — extract a shared helper.

## Working method

- Prefer the dedicated tools (Read/Edit/Grep) over shell equivalents.
- After changes, run `npx tsc --noEmit`, `npx eslint src`, and `npm run build`. All three
  must pass before you call something done.
- Schema changes need a migration. The DB is Supabase (project ref `qcrkhrhqugdyyliaevzf`).
  Adding a table requires **enabling RLS on it** — `db:push` does not do this.
- Verify observable changes in the running app; don't claim something works untested.
  Be honest about what you could and couldn't verify.

## When requirements conflict with the architecture

Explain the conflict and the trade-off **before** changing anything. Preserve the clean
layered architecture and the security model unless the user explicitly accepts the cost.

## The knowledge base

| File | Purpose |
|---|---|
| `PROJECT_CONTEXT.md` | What Meino is — stack, roles, features, status |
| `VISION.md` | Why it exists and the long-term direction |
| `ROADMAP.md` | Phased plan (Phase 1 free → Phase 2 monetization → future) |
| `ARCHITECTURE.md` | How auth, DB, storage, routing, uploads, security fit together |
| `CODING_STANDARDS.md` | How we write code here |
| `SECURITY.md` | Every security control and why it exists |
| `PERFORMANCE.md` | Current and planned performance work |
| `BUSINESS_MODEL.md` | Pricing and the reasoning behind it |
| `TODO.md` | Living development tracker |
| `LEGAL.md` | Legal pages, moderation/reporting, verification, and audit-log workflows |
| `PRODUCTION_CHECKLIST.md` | Env vars, deployment, manual QA, and rollback checklist |

Keep these documents current. When you complete meaningful work, update `TODO.md` and any
file whose facts changed, so the next session starts from truth.
