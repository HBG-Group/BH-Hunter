# Security Policy

Meino (the `HBG-Group/BH-Hunter` repository) takes security reports seriously.
Thank you for helping keep the project and its users safe.

## Reporting a vulnerability

Please report suspected vulnerabilities privately. Do not open a public issue
for anything that could expose user data or bypass authorization.

- Preferred: open a private [GitHub security advisory](https://github.com/HBG-Group/BH-Hunter/security/advisories/new).
- Fallback: contact the maintainers through the repository when a private
  advisory is unavailable.
- Machine-readable policy: the deployed site serves `/.well-known/security.txt`.

Please include, where possible:

- a clear description of the issue and its impact,
- affected URL, endpoint, or component,
- reproduction steps or a proof of concept,
- any relevant logs, request IDs, or screenshots (redact secrets and personal data).

## Scope

In scope:

- authentication and session handling,
- authorization and cross-owner data access,
- upload tickets and Supabase Storage access,
- admin surfaces and privileged actions,
- injection, SSRF, and unsafe redirect handling.

Out of scope:

- findings that require a compromised device or a malicious browser extension,
- self-XSS that requires the victim to paste attacker-supplied input,
- missing hardening headers with no demonstrated impact,
- automated scanner output without a working proof of concept.

## Our commitments

- Acknowledge receipt as quickly as practical.
- Triage severity using critical, high, medium, and low.
- Track remediation and verification in the security register.
- Credit responsible reporters on request once a fix has shipped.

These commitments and the remediation targets are described in more detail in
[`docs/VULNERABILITY_DISCLOSURE.md`](docs/VULNERABILITY_DISCLOSURE.md).

## Supported versions

The project is a continuously deployed web application. Only the current
production deployment and the default branch receive security fixes.
