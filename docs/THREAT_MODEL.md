# Threat Model Summary

Last updated: July 27, 2026

## Trust boundaries

- Browser to Next.js application
- Next.js application to Supabase Auth
- Next.js application to Prisma/Postgres
- Next.js application to Supabase Storage
- Administrators to admin-only actions and views

## Data flow

```text
Browser
  | HTTPS, server actions, route handlers
  v
Next.js on Vercel
  | Supabase SSR session validation
  +--> Supabase Auth
  | Prisma with server-only database credentials
  +--> Supabase Postgres
  | signed, owner-bound upload ticket
  +--> Supabase Storage
  |
  +--> Vercel deployment, logs, and security controls
```

Data from the browser is validated at the Server Action or Route Handler boundary.
The browser receives only publishable Supabase configuration; service credentials,
Prisma access, and upload-ticket signing remain server-only.

## Primary assets

- User identities and roles
- Listing records and owner-controlled media
- Student reviews, favorites, and viewing requests
- Supabase service credentials and upload-ticket secret

## Asset inventory

| Asset | Classification | Control owner | Primary protection |
| --- | --- | --- | --- |
| Supabase Auth identities and sessions | Restricted | Engineering / Operations | Supabase Auth, server-side `getUser`, recent auth |
| Profiles, listings, reviews, and requests | Confidential | Engineering | Prisma-only server access, Supabase RLS |
| Listing images | Internal | Engineering | signed upload tickets, Storage limits and policies |
| Upload-ticket and service credentials | Secret | Operations | server environment only; never `NEXT_PUBLIC_*` |
| Vercel deployment and GitHub repository | Restricted | Engineering / Operations | branch protection, CI, secret scanning |

## Key abuse cases

- Owner attempts to modify another owner's listing or photos
- Student attempts to invoke owner/admin actions directly
- Attacker tampers with upload tickets or registers forged storage paths
- Attacker abuses auth flows for enumeration or credential stuffing
- Admin session theft leading to destructive moderation actions

## Current mitigations

- Server-side role enforcement in actions
- Owner-scoped data access
- Signed upload tickets with expiry and path binding
- Generic auth failure messages
- Recent-auth requirement for sensitive writes
- Structured security-event logging

## Abuse-case mitigations

| Abuse case | Mitigation | Verification |
| --- | --- | --- |
| Cross-owner listing or photo access | owner-scoped queries and server-side owner guard | upload-ticket and authorization regression tests |
| Direct student/admin action invocation | server-side profile and role guards | protected-action inventory and role-guard review |
| Forged or replayed upload ticket | HMAC, owner/listing binding, expiry, path validation | upload-ticket regression tests |
| Oversized, unexpected, or malformed input | strict Zod schemas and field limits | validation regression tests |
| Credential stuffing | auth rate limit and generic login response | auth action and rate-limit review |
| Admin compromise | recent auth, audit events, branch and platform controls | operational MFA and audit-log verification remain required |
