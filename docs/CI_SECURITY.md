# CI and Security Automation

Last updated: July 27, 2026

## Repository-managed workflows

- `.github/workflows/security-checks.yml`
  - installs dependencies
  - runs `npm run lint`
  - runs `npm run typecheck`
  - runs the security regression suite via `npm test`
  - runs `npm audit --omit=dev`
  - generates and retains a CycloneDX SBOM artifact
- `.github/workflows/codeql.yml`
  - runs GitHub CodeQL on pushes, pull requests, and a weekly schedule
- `.github/CODEOWNERS`
  - requests the maintainers as reviewers for security-sensitive paths
- `.github/dependabot.yml`
  - opens weekly dependency updates for npm packages and GitHub Actions
- `.github/workflows/dast.yml`
  - runs an OWASP ZAP baseline scan against an authorized URL on manual dispatch

## Dynamic testing

The ZAP baseline workflow (`dast.yml`) is manual-only so it never scans
production by accident. Run it from **Actions -> DAST (OWASP ZAP Baseline) ->
Run workflow** with an authorized staging or Preview URL. The scan is passive
plus the alpha rule set (`-a`); it does not authenticate or perform destructive
actions.

Dispatches are validated before scanning: the target must be an absolute
`https://` URL without credentials and must use the default HTTPS port. Its host
must match the `DAST_ALLOWED_HOSTS` repository variable (comma-separated exact
hostnames; a leading `*.` allows subdomains). Configure this in **Settings ->
Secrets and variables -> Actions -> Variables**. It is required and has no
default. Use a separate `SECURITY_CHECK_ALLOWED_HOSTS` variable for deployment
header and route checks, since those checks may include production while DAST
should remain limited to authorized staging hosts. Prefer exact hostnames.

Retain, for each run, the scanner version and rules file, the target URL, the
date, and the uploaded `zap-baseline-report` artifact. Triage findings, open a
remediation issue for anything real, and re-run after the fix to preserve the
retest output.

## Patch policy

- Critical vulnerabilities: triage within 24 hours; remediate or formally risk-accept within 72 hours.
- High vulnerabilities: triage within three business days; remediate or formally risk-accept within 14 days.
- Medium and low vulnerabilities: review in the next scheduled maintenance cycle.
- Dependency updates and security findings require an owner, due date, validation evidence, and a security-register entry.

## Current limitations

- Branch protection, production-environment protection, collaborator review, and GitHub secret-scanning activation require repository settings and evidence outside the checkout.
- Dependency review on pull requests requires the repository Dependency Graph to be enabled in **Settings -> Code security**; it is not enabled today, so dependency changes are covered by Dependabot and `npm audit` instead.
- The full lockfile audit currently reports five high-severity dependency paths through the development-only `braces@3.0.3` dependency of `eslint-config-next`. The production-only audit is clean. The upstream advisory has no patched release; the item is tracked in `docs/SECURITY_REGISTER.md` for reassessment.
