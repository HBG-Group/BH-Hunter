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
- `.github/dependabot.yml`
  - opens weekly dependency updates for npm packages and GitHub Actions

## Patch policy

- Critical vulnerabilities: triage within 24 hours; remediate or formally risk-accept within 72 hours.
- High vulnerabilities: triage within three business days; remediate or formally risk-accept within 14 days.
- Medium and low vulnerabilities: review in the next scheduled maintenance cycle.
- Dependency updates and security findings require an owner, due date, validation evidence, and a security-register entry.

## Current limitations

- Branch protection, production-environment protection, collaborator review, and GitHub secret-scanning activation require repository settings and evidence outside the checkout.
