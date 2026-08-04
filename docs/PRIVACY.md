# Privacy Controls

Last updated: July 27, 2026

## Data inventory

The application stores these main categories of personal data:

- Profile data: full name, email, phone, avatar URL, role, verification flag
- Listing data: owner-managed property details, room data, images, nearby places
- Student activity: favorites, recently viewed listings, reviews, viewing requests
- Notifications: notification preferences and delivered notification records
- Account metadata: created/updated timestamps and subscription scaffolding

## Purpose and retention

- Profile data: retained while the account is active
- Listings and related records: retained while the owner account is active
- Reviews, favorites, view history, and viewing requests: retained while the student account is active
- Notifications: retained while the account is active unless later retention pruning is introduced

## User controls

- `GET /account/privacy/export` downloads a JSON export of the signed-in account's stored application data.
- `/account/privacy` provides a delete flow that removes the profile and cascaded application records.
- Account deletion also removes owner listing records and attempts best-effort storage cleanup for owned listing photos.

## Remaining operational work

- Define backup retention and deletion behavior outside the repository.
- Verify downstream deletion expectations in Supabase backups and platform logs.
- Keep the public privacy notice aligned with this document and the live product.
