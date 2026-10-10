# Supabase Auth SMTP setup

Meino sends signup confirmation and password-reset messages through Supabase Auth. The
application does not need an SMTP library or SMTP secrets; configure the provider in the
Supabase project so Auth sends these messages directly.

## Recommended provider: Resend

The project already uses Resend for application email, so Resend is a natural provider
for Auth SMTP as well. Use a dedicated authentication sender such as
`no-reply@auth.your-domain.com`, not the address used for marketing or general notices.

1. In Resend, add and verify the sending domain.
2. Publish the SPF and DKIM DNS records Resend provides. Add DMARC when the domain is
   ready for enforcement.
3. Create an SMTP credential/API key with permission to send from that domain.
4. In Supabase, open **Authentication → Emails → SMTP Settings**, enable custom SMTP,
   and enter:

   - Host: `smtp.resend.com`
   - Port: `465` (SSL) or `587` (STARTTLS)
   - Username: `resend`
   - Password: the Resend API key/SMTP password
   - Sender email: the verified `no-reply@auth...` address
   - Sender name: `Meino`

5. Keep email confirmation enabled and make sure the Supabase Site URL is the production
   Meino URL. The app already sends confirmation links to `/auth/confirmed` on the
   configured `NEXT_PUBLIC_SITE_URL`.
6. Review **Authentication → Rate Limits**. Supabase applies a default custom-SMTP
   Auth-email limit of 30 messages per hour for new projects; increase it only after the
   sender domain and provider limits are ready.
7. Test a new signup and password reset using an address outside the Supabase team. Check
   both Supabase Auth logs and the provider delivery logs.

## Secrets

Do not add the SMTP password, Resend API key, or Supabase management token to this
repository. Store provider credentials only in the Supabase dashboard. The existing
`RESEND_API_KEY`/`RESEND_FROM` variables are used by Meino's application emails and do
not configure Supabase Auth.

## Failure handling

If the provider rejects a message, Supabase Auth will report the handoff error in Auth
logs and the app will show its existing generic signup/reset error. Email delivery after
handoff is controlled by the provider, so verify domain authentication, sender identity,
spam complaints, and bounce logs there.
