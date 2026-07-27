# API Inventory

Last updated: July 27, 2026

## Public route handlers

- `GET /account/privacy/export`: authenticated account data export
- `GET /.well-known/security.txt`: public vulnerability disclosure metadata

## Protected Server Actions

- Auth: sign in, sign up, sign out
- Owner: create listing, update listing, confirm vacancies, set draft/pending status, prepare/register/delete photos
- Student: favorites, reviews, viewing requests, notifications
- Admin: verify listings, moderate status, feature listings, manage owner verification, moderate reviews, manage advertisements

## Review notes

- All state-changing actions are expected to validate input and enforce auth server-side.
- Sensitive administrative and destructive actions now require recent authentication and emit structured security events.
