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

## Customer communication templates

### Initial notice

We are investigating a security incident affecting the service. We have contained the
known impact and will provide an update after the investigation establishes what data
or accounts were affected. Do not share passwords or verification codes with anyone.

### Resolution notice

The incident has been contained. The affected service has been restored and we have
completed the required credential rotation and validation steps. If action is required
for your account, we will contact you directly with the specific steps.

### Service update

We are investigating an availability or security issue. The service may be limited
while we contain the problem. The next update will be published after the incident
lead confirms the current impact and recovery status.
