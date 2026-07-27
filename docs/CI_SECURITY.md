# CI and Security Automation

Last updated: July 27, 2026

## Repository-managed workflows

- `.github/workflows/security-checks.yml`
  - installs dependencies
  - runs `npm run lint`
  - runs the security regression suite via `npm test`
  - runs `npm audit --omit=dev`
- `.github/workflows/codeql.yml`
  - runs GitHub CodeQL on pushes, pull requests, and a weekly schedule
- `.github/dependabot.yml`
  - opens weekly dependency updates for npm packages and GitHub Actions

## Current limitations

- Branch protection, required checks, and secret scanning activation still require GitHub repository settings.
- The repository-wide `npm run typecheck` baseline is currently broken by pre-existing Prisma/type drift on this branch, so it is not yet promoted into required CI for this security remediation.
