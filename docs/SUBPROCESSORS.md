# Subprocessors and Vendors

Last updated: August 3, 2026

This inventory lists the third-party services that process data for the
application. It is derived from the repository (dependencies, configuration, and
source usage). Contract terms, data-processing agreements, and jurisdictional
review must be attached externally; those columns stay _pending_ until an
accountable owner confirms them.

| Subprocessor | Purpose | Data involved | Repository evidence | Contract / DPA |
| --- | --- | --- | --- | --- |
| Supabase | Authentication, managed Postgres database, object storage | Account identity and email, profiles, listings, reviews, favorites, viewing requests, uploaded photos | `NEXT_PUBLIC_SUPABASE_URL`, `DATABASE_URL`, `src/lib/supabase`, `src/lib/storage`, `prisma/` | _pending_ |
| Vercel | Application hosting, serverless runtime, deployment and request logs | Request metadata, application and security-event logs | `vercel.json`, `next.config.ts` | _pending_ |
| Upstash | Managed Redis used as a read-through cache for public reads | Cached public listing data with a short TTL | `src/lib/cache/redis.ts`, `UPSTASH_REDIS_REST_URL` | _pending_ |
| Resend | Transactional email delivery (for example payment notifications) | Recipient email address and message content | `src/lib/email/resend.ts`, `src/lib/email/payment.ts` | _pending_ |
| Google | OAuth identity provider for sign-in | Google account identifier, email address, display name | `src/components/auth/GoogleButton.tsx`, `src/app/auth/callback/route.ts` | _pending_ |
| OpenStreetMap | Map tile delivery, requested directly by the browser | Client IP-level request metadata when maps render | `src/lib/map/provider.ts` | _pending_ |
| GitHub | Source control, CI/CD, CodeQL, Dependabot, private security advisories | Source code and commit metadata | `.github/`, `SECURITY.md` | _pending_ |

## Notes

- Map tiles are requested by the browser directly from OpenStreetMap, so the
  visitor's IP address is visible to that provider.
- The cache stores only public listing data and is configured with a short TTL,
  so no long-lived personal data is retained outside Supabase.
- Public security and compliance claims on the website should be reviewed
  against this list before they are published.

## Evidence to attach

- Confirmed contract or data-processing agreement for each row above.
- The list of jurisdictions and data categories relevant to the current product.
- The accountable owner and review date for this inventory.
