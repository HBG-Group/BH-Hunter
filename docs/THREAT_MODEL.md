# Threat Model Summary

Last updated: July 27, 2026

## Trust boundaries

- Browser to Next.js application
- Next.js application to Supabase Auth
- Next.js application to Prisma/Postgres
- Next.js application to Supabase Storage
- Administrators to admin-only actions and views

## Primary assets

- User identities and roles
- Listing records and owner-controlled media
- Student reviews, favorites, and viewing requests
- Supabase service credentials and upload-ticket secret

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
