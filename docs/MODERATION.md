# Moderation and Account Suspension Procedure

Last updated: July 30, 2026

## Scope

Use this procedure for credible reports of fraud, harassment, impersonation, malicious
uploads, review manipulation, or repeated policy violations.

## Procedure

1. Preserve the report, relevant record IDs, timestamps, request IDs, and available
   audit events before taking action.
2. Restrict access through the least disruptive available control while the report is
   assessed. Do not delete evidence.
3. Record the decision, rationale, reviewer, and review date in the security register.
4. Notify the affected user using the incident communication process when notification
   is appropriate and legally permitted.
5. Escalate suspected account takeover, data exposure, privileged-user misuse, or a
   service-key leak to the incident-response process immediately.
6. Restore access only after an accountable reviewer records the reason and any
   required remediation, such as identity verification or credential reset.

## Current implementation limit

The application does not yet have a persisted suspension state or support tooling.
Until it does, access restriction requires an administrator and provider-side action;
this document defines the evidence and approval process but does not replace that
implementation.
