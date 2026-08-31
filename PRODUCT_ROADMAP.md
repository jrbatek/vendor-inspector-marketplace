# InspectSource Product Roadmap

## Product mission
Build the easiest, fairest global platform for requesting, performing, managing, and learning from third-party inspections.

## Product principles
1. **Inspector-first:** inspectors do not pay to join, be matched, rank higher, or access professional tools that help them improve.
2. **Enterprise-funded:** clients and enterprises pay transparent fees for workflow, coordination, analytics, integrations, API access, governance, and marketplace value.
3. **Upload once, never type twice:** extract structured data from documents, emails, requests, reports, certificates, and client files whenever possible.
4. **One engine, many inputs:** natural language, email, and structured forms must normalize into the same request object and matching engine.
5. **Demo mirrors production:** demo experiences are synthetic/populated versions of the real product architecture, not separate products.
6. **Explain decisions:** clients see why inspectors match; inspectors receive Selection Insights after decisions without exposing competing inspector identities.
7. **Transparent economics:** inspector rate, InspectSource fee, client total, budgets, and actuals are explicit.
8. **Simple before clever:** eliminate unnecessary clicks, duplicate entry, hidden states, and technical error messages.
9. **Data belongs to the user:** clients can export and access their data through APIs; inspectors control their profile and source documents.
10. **Evidence over invention:** AI may organize, summarize, and suggest, but never invent qualifications, certifications, experience, inspection findings, or client feedback.

## Current product spine
Client request -> normalized requirement -> eligibility gates -> ranked inspectors -> availability/selection -> assignment -> scheduling -> inspection/reporting -> billing -> history -> analytics/benchmarking -> Selection Insights.

## Priority backlog
### P0 - Reliability and consistency
- Keep Client Workspace navigation persistent across all client workflows.
- Ensure natural-language, email, and structured requests normalize identically.
- Separate hard eligibility requirements from ranking quality.
- Make schedule availability a hard gate.
- Add regression tests for required certifications, rates, travel/location, minimum experience, and availability.
- Standardize human-readable lookup values; never expose database IDs/codes in user-facing dropdowns.
- Validate auth routing for client vs inspector accounts.

### P1 - Inspector Smart Onboarding
- Upload CV/resume and qualification documents.
- AI extract supported facts with evidence/confidence.
- Inspector approve/edit/reject each extracted fact.
- Persist approved facts into normalized Supabase profile tables.
- Preserve original documents.
- Create standardized inspector-approved CV.
- Track certification verification and expirations.
- Suggest profile improvements without inventing experience.

### P1 - Client workspace
- Request Inspectors: natural language, email, structured selection.
- Active inspections: schedule, status, client actions, budget vs actual, reports, NCRs.
- Inspection history: searchable by project, supplier, inspector, equipment, location, date, status, NCR.
- Analytics: spend, schedule, NCR, supplier/inspector performance, anonymized peer benchmarking.
- Billing & Payment.
- Contracts.
- Organization profile, users, roles, notifications, API/integrations.

### P1 - Inspector workspace
- Opportunities and active assignments.
- Schedule/calendar with travel, tentative holds, blocked dates, and availability.
- Selection Insights.
- Ratings detail.
- Profile/qualifications and document center.
- Reports.
- History and earnings.

### P2 - Enterprise intelligence
- Supplier performance and risk.
- Equipment and asset history.
- NCR benchmarking.
- Cost and schedule benchmarking.
- Predictive inspection planning.
- API/ERP/procurement/Power BI integrations.
- SSO, RBAC, audit history, governance.

## Autonomous development rules
The autonomous development loop should always select the highest-value safe task from this roadmap, current test failures, production errors, or UX inconsistencies.

### May ship automatically after all checks pass
- Copy and error-message improvements.
- Accessibility fixes.
- Responsive/layout fixes.
- Consistency between demo and production.
- Test coverage and synthetic-data improvements.
- Low-risk UI bugs.
- Non-destructive performance improvements.

### Must stop at a reviewable PR
- Authentication/authorization policy changes.
- Billing/payment behavior.
- Destructive migrations or data deletion.
- New secrets/infrastructure requiring account-level setup.
- Changes to inspector compensation or platform fees.
- Material matching/eligibility/business-rule changes.
- Anything that could expose PII, confidential client data, or inspector identity improperly.

## Definition of done
A change is not done until:
- TypeScript passes.
- Unit/regression tests pass.
- Migration checks pass when applicable.
- Production build succeeds.
- Synthetic-data QA passes.
- Relevant Vercel deployment is healthy.
- No known regression to client/inspector demo parity.
- DEVELOPMENT_LOG.md is updated for meaningful work.
