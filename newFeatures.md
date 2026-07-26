\# Monetization + Performance + UX Upgrade (Planning First, Production Quality)



We are moving BH Hunter closer to a real production-ready platform. Implement the following carefully while maintaining the existing architecture, security improvements, and clean codebase.



\## IMPORTANT RULES



\- DO NOT break any existing functionality.

\- Keep every file under \~150 lines whenever reasonably possible.

\- If a file becomes too large, split it into reusable modules/components/hooks.

\- Use simple comments only. No AI-style comments. Comments should help sophomore students understand the purpose of the code.

\- Preserve accessibility and mobile responsiveness.

\- Continue following the existing code style and folder structure.



\---



\# PART 1 — Listing Limit System (Implement)



Implement a listing limit for boarding house owners.



Rules:



\- Every owner gets \*\*5 FREE listings\*\*.

\- Once they already have 5 listings, they may still create additional listings.

\- Every listing beyond the fifth should require payment.



Pricing:



\- Listing #1–5 = FREE

\- Listing #6 onwards = ₱29 per listing



For now:



\- Do NOT integrate any payment gateway.

\- Instead:

&#x20;   - detect when an owner exceeds 5 listings

&#x20;   - show a clean modal/page explaining:



&#x20;       "You have used all 5 free listings.

&#x20;       Additional listings cost ₱29 each."



\- Include a fake "Proceed to Payment" button.

\- The button should simply display:

&#x20;   "Payment integration coming soon."



Design the architecture so adding Maya/GCash/PayMongo later is easy.



\---



\# PART 2 — Monthly Subscription (Prepare Only)



We want subscriptions in the future.



DO NOT ENABLE THEM.



Prepare the entire architecture only.



Create:



Subscription model



Fields similar to:



\- plan

\- status

\- startedAt

\- expiresAt

\- renewalDate

\- paymentReference



Prepare:



\- middleware

\- helper functions

\- database model

\- reusable utilities



Comment out everything that would enforce subscriptions.



Nothing should affect the current website.



Think of this as scaffolding only.



\---



\# PART 3 — Revenue Roadmap



Our rollout plan is:



Phase 1 (Current)



Everything FREE.



Testing period:

1 month.



No payments.



No restrictions except preparing the backend.



Phase 2



Launch monetization.



Owners receive:



\- 5 FREE listings

\- ₱29 per listing beyond 5

\- ₱99 monthly owner subscription



Design the architecture around this roadmap.



Do NOT implement Phase 2 payments yet.



\---



\# PART 4 — Verified Owner Badge



Implement a verification system.



Owner profile:



verified = true / false



When verified:



Display:



✓ Verified Owner



Requirements:



\- clean badge

\- professional styling

\- reusable component



Verification is controlled only by Admin.



No owner should be able to verify themselves.



\---



\# PART 5 — Featured Listings (Infrastructure Only)



Prepare a Featured Listing system.



Do not monetize yet.



Each listing should have:



featured = true / false



Homepage:



If featured exists:



Show featured listings first.



Admin controls this.



Owner cannot.



\---



\# PART 6 — Local Advertisement System



Implement a simple advertisement system.



Target advertisers:



\- Laundry

\- Cafes

\- Water stations

\- Printing shops

\- Computer shops

\- Internet providers

\- Convenience stores



Admin should be able to create advertisements.



Advertisement contains:



\- title

\- image

\- description

\- optional website

\- optional Facebook page

\- optional Messenger

\- start date

\- expiry date



Homepage:



Show advertisements naturally.



Never intrusive.



Good placements:



\- below hero

\- between listing sections

\- sidebar (desktop)



Mobile:



Keep clean.



Never annoying.



Prepare this so paid advertisements can easily be enabled later.



\---



\# PART 7 — Redis Preparation



DO NOT integrate Redis yet.



Instead:



Create a caching strategy document.



Explain:



\- what should be cached

\- cache keys

\- expiration times

\- invalidation rules



Recommended cache:



Homepage listings



5 min



Listing details



10 min



Reviews



10 min



Map markers



5 min



Statistics



15 min



Owner dashboard metrics



5 min



Document how Upstash Redis will plug into the current architecture.



No implementation required.



\---



\# PART 8 — Performance Improvements



Improve perceived performance.



Implement:



\## Skeleton Loading



Instead of blank pages:



Use skeleton placeholders.



Apply to:



\- homepage

\- listings

\- detail page

\- owner dashboard



\---



\## Optimistic UI



Immediately update:



\- favorites

\- saves

\- likes



Do not wait for server response.



Rollback only if request fails.



\---



\## Lazy Loading



Lazy load:



\- images

\- heavy components

\- maps where appropriate



Do not hurt SEO.



\---



\## Image Optimization



Automatically:



\- use WebP

\- use AVIF where supported

\- generate thumbnails

\- avoid serving unnecessarily large originals



\---



\## Pagination / Infinite Loading



Avoid loading every listing immediately.



Load in batches.



Example:



20 listings



↓



Load More



or



Infinite Scroll



Keep animations smooth.



\---



\# PART 9 — User Experience Improvements



Continue making the website feel premium.



Whenever users:



\- favorite

\- submit forms

\- save changes

\- upload photos

\- navigate pages



Provide:



\- loading indicators

\- progress animations

\- success feedback



Never leave users wondering whether their click worked.



Every interaction should feel responsive.



\---



\# PART 10 — Code Quality



Keep components reusable.



Avoid duplicated logic.



Extract utilities when repeated.



Maintain small files.



Continue following:



\- secure architecture

\- clean folder structure

\- maintainable code



\---



\# DELIVERABLES



Provide:



1\. Summary of all implemented features.



2\. Database/schema changes.



3\. New folders/files created.



4\. Redis integration plan document.



5\. Future payment integration points.



6\. Any assumptions made.



Do not remove existing functionality.



Treat this as preparing BH Hunter to become a scalable commercial product while keeping the current student-friendly codebase.

