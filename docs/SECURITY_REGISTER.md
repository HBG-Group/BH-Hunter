# Security Register

Last updated: July 27, 2026

| Control | Owner | Status | Evidence | Risk | Due date | Next review |
| --- | --- | --- | --- | --- | --- | --- |
| Production security headers | Engineering | Implemented in repo | `next.config.ts`, commit `70a7bf2` | Medium until prod verified | 2026-07-27 | Before launch |
| Dedicated upload ticket secret | Engineering / Ops | Implemented in repo, prod env pending | `src/lib/security/upload-ticket-core.ts`, `.env.example` | High if prod secret unset | Before launch | Before launch |
| Recent auth for sensitive actions | Engineering | Implemented in repo | commit `77f0205` | Medium until manual test | Before launch | Before launch |
| Structured security logging | Engineering / Ops | Implemented in repo | `src/lib/security/events.ts` | Medium until log sink and alerts verified | Before launch | Before launch |
| Account export and deletion | Engineering | Implemented in repo | `/account/privacy`, export route | Medium until production walkthrough | Before launch | Before launch |
| Security disclosure policy | Engineering | Implemented in repo | `docs/VULNERABILITY_DISCLOSURE.md`, `/.well-known/security.txt` | Low | 2026-07-27 | Quarterly |
| Incident response plan | Engineering / Ops | Drafted in repo | `docs/INCIDENT_RESPONSE.md` | Medium until owner assignment and exercise | Before launch | Quarterly |
