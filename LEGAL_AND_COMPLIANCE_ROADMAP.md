\# Meino — Legal, Compliance \& Trust Roadmap



\## Objective



Prepare Meino for a public production launch by implementing all legal, trust, moderation, privacy, and compliance features that a real SaaS marketplace should have.



IMPORTANT:



\- Do NOT overengineer.

\- Follow modern SaaS best practices.

\- Keep files modular (\~150 lines where practical).

\- Reuse existing components whenever possible.

\- Maintain Meino's design language.

\- Mobile responsive.

\- Accessibility compliant.

\- Preserve all existing functionality.

\- Do NOT introduce breaking changes.



\---



\# Phase 1 — Legal Pages



Create the following pages.



\## 1. Privacy Policy



Purpose:



Explain how Meino collects, stores, processes, and protects user information.



Include:



\- Information collected

\- Purpose of collection

\- Authentication

\- Cookies

\- Storage

\- Security

\- Account deletion

\- Data retention

\- Contact information



Use plain English.



Avoid unnecessary legal jargon.



\---



\## 2. Terms of Service



Create a complete Terms of Service.



Include:



\- User responsibilities

\- Owner responsibilities

\- Student responsibilities

\- Account suspension

\- Account termination

\- Prohibited activities

\- Intellectual property

\- Limitation of liability

\- Subscription terms (future-ready)

\- Changes to the service



\---



\## 3. Community Guidelines



Create clear community rules.



Examples:



\- Respect others

\- No harassment

\- No scams

\- No hate speech

\- No discrimination

\- No fake listings

\- No fake reviews

\- No spam



Include consequences.



\---



\## 4. Cookie Policy



Explain:



\- Essential cookies

\- Preference cookies

\- Analytics cookies (future)

\- How users manage cookies



\---



\## 5. Copyright / Content Removal Policy



Create a page explaining:



How copyright owners can request removal of content.



Include:



\- Required information

\- Contact process

\- Review process

\- Counter-notification process



\---



\# Phase 2 — Trust \& Safety



Implement moderation tools.



\---



\## Report Listing



Allow students to report listings.



Reasons:



\- Fake Listing

\- Scam

\- Wrong Information

\- Offensive Content

\- Duplicate

\- Other



Reports should appear inside the Admin Dashboard.



\---



\## Report Review



Students and owners should be able to report reviews.



Reasons:



\- Spam

\- False Information

\- Offensive

\- Harassment



\---



\## Report Owner



Allow users to report abusive owners.



\---



\## Report Student



Allow owners to report abusive students.



\---



\# Phase 3 — Verified Owners



Improve the Verified Badge system.



Prepare (do not fully automate yet):



Verification Status



Pending



Approved



Rejected



Future support for:



\- Business Permit

\- Valid ID

\- Proof of Ownership



Do not require uploads yet.



Only prepare the architecture.



\---



\# Phase 4 — Admin Audit Logs



Every important admin action should be logged.



Examples:



Approve Listing



Reject Listing



Delete Listing



Freeze Owner



Delete Owner



Delete Review



Resolve Report



Each log should include:



Admin



Timestamp



Action



Affected Record



Reason



Logs should be read-only.



\---



\# Phase 5 — User Safety



Display safety reminders.



Examples:



Never send deposits without viewing the property.



Always verify listing information.



Report suspicious behavior.



Meet in safe public places.



These reminders should appear naturally throughout the website.



\---



\# Phase 6 — Empty States



Improve all empty states.



Examples:



No Listings



No Favorites



No Reviews



No Reports



No Notifications



Every empty page should guide users toward their next action.



\---



\# Phase 7 — Contact Us



Create a professional Contact page.



Include:



General Questions



Support



Business



Bug Reports



Social Media



Future Email



Frequently Asked Questions



\---



\# Phase 8 — Footer Improvements



Add links:



Privacy Policy



Terms of Service



Community Guidelines



Cookie Policy



Copyright Policy



Contact



Pricing



About



Report Bug



Report Security Issue



\---



\# Phase 9 — Cookie Consent



Create a professional cookie consent component.



Allow:



Accept All



Reject Non-Essential



Customize



Remember the user's preference.



Do not repeatedly display the banner.



\---



\# Phase 10 — Accessibility



Review every page.



Ensure:



Keyboard navigation



Visible focus states



ARIA labels



Accessible dialogs



Accessible buttons



Proper heading hierarchy



Proper color contrast



\---



\# Phase 11 — Security Review



Perform a complete security review.



Check:



Authentication



Authorization



RLS assumptions



Storage



API routes



Uploads



Rate limits



Input validation



Output escaping



Session handling



Cookies



Admin routes



Owner routes



Student routes



Guest routes



Document findings.



\---



\# Phase 12 — Production Readiness



Create:



context/PRODUCTION\_CHECKLIST.md



Include:



Environment Variables



Supabase



Redis



Vercel



Authentication



Storage



Security



Backups



Monitoring



Logging



Analytics



Deployment Checklist



Manual QA Checklist



Rollback Plan



\---



\# Phase 13 — Documentation



Create:



context/LEGAL.md



Document:



Legal pages



Moderation workflow



Reporting workflow



Verified Owner workflow



Audit Log workflow



Privacy model



Security model



Future compliance considerations



\---



\# Final Deliverables



After completion provide:



1\. Files created



2\. Components created



3\. Routes added



4\. Database changes



5\. Security improvements



6\. Accessibility improvements



7\. Production readiness summary



8\. Remaining recommendations before public launch

