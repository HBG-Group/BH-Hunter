# PR 34 scope and deployment requirements

This change includes the PWA shell plus the related application work already present
on the branch: subscription events and owner billing/entitlements, admin notifications
and subscription CSV export, owner settings, map discovery, and PhotoManager.

These are intentionally documented together because the PWA routes and owner workflows
share the same auth, storage, and deployment surface. If the release is intended to be
PWA-only, split those features into a follow-up before merging.

## Auth redirect configuration

Set `NEXT_PUBLIC_SITE_URL` to the canonical HTTPS public origin in production. Add only
the exact callback URLs used by this deployment to Supabase Redirect URLs:

- `https://<canonical-public-host>/auth/callback`
- `https://<canonical-public-host>/auth/confirmed`

Do not add `https://*.vercel.app/*`; that would allow an unrelated Vercel project to
receive an OAuth authorization code. Preview testing should use an explicitly added,
trusted preview URL or the canonical site URL.
