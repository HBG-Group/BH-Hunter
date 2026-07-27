# Incident Response Plan

Last updated: July 27, 2026

## Severity levels

- Sev 1: confirmed account compromise, admin compromise, data exposure, or active unauthorized access
- Sev 2: high-impact vulnerability without confirmed exploitation
- Sev 3: contained issue with limited user impact

## Roles

- Incident lead: coordinates containment, evidence capture, and status updates
- Engineering owner: implements mitigation and recovery changes
- Communications owner: prepares internal and external messaging when needed

## Initial response checklist

1. Confirm the signal and record time, reporter, and affected surface.
2. Preserve evidence such as logs, request IDs, screenshots, and impacted record IDs.
3. Contain the issue by disabling affected flows, rotating secrets, or restricting access.
4. Assess impact and decide severity.
5. Track remediation, validation, and follow-up actions in the security register.

## Playbooks to maintain

- Account takeover
- Admin compromise
- Leaked service-role key
- Storage or RLS exposure
- Malicious uploads
- Supply-chain compromise

## Post-incident requirements

- Document timeline, root cause, customer impact, and corrective actions.
- Add regression tests or monitoring where applicable.
- Update the security register and linked procedures.
