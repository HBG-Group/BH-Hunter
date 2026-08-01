# API Inventory

Last updated: July 27, 2026

## Public route handlers

- `GET /account/privacy/export`: authenticated account data export
- `GET /.well-known/security.txt`: public vulnerability disclosure metadata

## Protected Server Actions

| Surface | Authentication and authorization | Input and resource controls |
| --- | --- | --- |
| Auth: sign in, sign up, sign out | public forms or current Supabase session | strict auth schema, rate limits, safe redirects |
| Owner: create/update listing, vacancies, draft/pending status | `requireOwner` | strict listing schema and owner-scoped database calls |
| Owner: prepare/register/delete photos | `requireOwner`, recent auth for deletion | signed owner/listing-bound ticket, Storage MIME and size recheck |
| Student: favorites, reviews, viewing requests, notifications | `requireProfile` | published-listing guard plus review/viewing schemas |
| Admin: listing verification, status, feature, owner verification, review and listing deletion | `requireAdmin`, recent auth | target existence checks, generic errors, audit events |
| Admin: advertisements | `requireAdmin` | advertisement schema and server-side storage access |

## Review notes

- Every state-changing action is classified above with its server-side authorization and validation boundary.
- Sensitive administrative and destructive actions require recent authentication and emit structured security events.
- Background jobs, WebSockets, webhooks, GraphQL, and public write route handlers are not implemented in this repository.
