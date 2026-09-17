# InspectSource Product Roadmap

## Product mission
Build the easiest, fairest global platform for requesting, performing, managing, and learning from third-party inspections — the place clients, inspection agencies, and independent inspectors go to source and deliver vendor inspection globally.

## Product principles
1. **Inspector-first:** inspectors do not pay to join, be matched, rank higher, or access professional tools that help them improve.
2. **Enterprise-funded:** clients and enterprises pay transparent fees for workflow, coordination, analytics, integrations, API access, governance, and marketplace value.
3. **Upload once, never type twice:** extract structured data from documents, emails, requests, reports, certificates, and client files whenever possible.
4. **One engine, many inputs:** natural language, email, and structured forms must normalize into the same request object and matching engine.
5. **Demo mirrors production:** demo experiences are synthetic/populated versions of the real product architecture, not separate products.
6. **Explain decisions:** clients see why inspectors match; inspectors receive Selection Insights after decisions without exposing competing inspector identities.
7. **Transparent economics:** inspector rate, agency/commercial rate where applicable, InspectSource fee, client total, budgets, and actuals are explicit.
8. **Simple before clever:** eliminate unnecessary clicks, duplicate entry, hidden states, and technical error messages.
9. **Data belongs to the user:** clients, agencies, and inspectors can export/access the data appropriate to their account and permissions.
10. **Evidence over invention:** AI may organize, summarize, and suggest, but never invent qualifications, certifications, experience, inspection findings, or client feedback.

## Marketplace participants
### Clients
Organizations that need vendor inspection. Clients can source from their contracted inspection agencies, independent inspectors, or both, subject to their organization settings and contract relationships.

### Agencies
Inspection companies with their own clients, contracts, employees, subcontractors, and resource-management processes. Agencies use InspectSource as a resource distribution and delivery channel while retaining the identity of the agency relationship. Agencies can maintain available inspector capacity through bulk upload and, ultimately, API/system integrations.

### Independent inspectors
Individual inspectors/subcontractors who maintain qualifications, availability, rates, work history, and documents directly in InspectSource.

## Current product spine
Client request -> source strategy (contracted agencies / independents / both) -> normalized requirement -> eligibility gates -> ranked resources -> availability/selection -> assignment -> scheduling -> inspection/reporting -> billing -> history -> analytics/benchmarking -> Selection Insights.

## P0 - Agency marketplace foundation
- Add **Agencies** as a first-class top-level product audience alongside Clients and Inspectors.
- Add Agency Login and a fully synthetic Agency Demo.
- Create persistent **Agency Workspace** navigation consistent with Client Workspace and InspectorHub.
- Agency profile/capabilities: company identity, countries/regions served, disciplines, industries, commodities/equipment, certifications/accreditations, office footprint, commercial/contact information, and client-contract relationships.
- Agency resource pool: employees, subcontractors, and other agency-controlled inspector resources.
- Bulk resource upload with validation, preview, error handling, and update semantics.
- Show future **API / resource-system integration** capability for syncing inspector profiles, qualifications, availability, and status. Production credentials/integration security stop at reviewable PR.
- Agency resource availability dashboard/calendar and assignment visibility.
- Agency opportunities: client requests available under applicable client/agency relationships; preview, respond, propose resources, request more information, accept/reject where appropriate.
- Agency reporting/operations: active assignments, submitted reports, NCRs, history, utilization, and operational analytics.
- Agency commercial view: applicable contracts, rates, budgets, spend/revenue, billing status, and client relationships.
- Preserve agency identity and contract provenance throughout matching, assignment, reporting, analytics, and billing.

## P0 - Client sourcing expansion for agencies
- Add **Source of Inspectors** to client request/search workflows:
  - Contracted agencies only
  - Independent inspectors only
  - Contracted agencies + independent inspectors
- Default/available source choices must respect the client's configured agency contracts and organization permissions.
- Add a client **Agencies / Contracted Agencies** view showing agency relationships, contract status, coverage, capabilities, budget/spend, and available resource pool indicators.
- Allow a client to restrict a request/search to one or more contracted agencies.
- Clearly label search/match results as **Agency resource** or **Independent inspector** without exposing information outside contract/privacy permissions.
- Keep the underlying qualification/availability eligibility logic consistent regardless of resource source; commercial/contract routing can differ by source.
- Add client analytics dimensions for source type and agency, including inspection count, spend, NCR, schedule, geography, commodity, and utilization/performance where supported.

## P0 - Agency demo data
- Populate a synthetic agency ecosystem representing large multinational, regional, and specialist inspection agencies without presenting fictional data as real company data.
- Include multiple client-agency contracts, global offices/coverage, employees/subcontractors, qualifications, commodities, availability, active assignments, completed inspections, reports, NCRs, budgets, spend/revenue, and utilization.
- Demonstrate bulk upload and API integration concepts using synthetic/non-production data only.
- Demonstrate a client request restricted to contracted agencies, then the same request expanded to include independent inspectors.

## Priority backlog
### P0 - Reliability and consistency
- Keep Client Workspace navigation persistent across all client workflows.
- Keep Agency Workspace navigation persistent across all agency workflows.
- Ensure natural-language, email, and structured requests normalize identically.
- Separate hard eligibility requirements from ranking quality.
- Make schedule availability a hard gate.
- Add regression tests for required certifications, rates, travel/location, minimum experience, availability, and source-of-inspector restrictions.
- Standardize human-readable lookup values; never expose database IDs/codes in user-facing dropdowns.
- Validate auth routing for client vs agency vs inspector accounts.

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
- Source strategy: contracted agencies, independents, or both.
- Contracted Agencies view and contract/resource visibility.
- Active inspections: schedule, status, client actions, budget vs actual, reports, NCRs.
- Inspection history: searchable by project, supplier, inspector, agency/source, equipment, location, date, status, NCR.
- Analytics: spend, schedule, NCR, supplier/inspector/agency performance, anonymized peer benchmarking.
- Billing & Payment.
- Contracts.
- Organization profile, users, roles, notifications, API/integrations.

### P1 - Agency workspace
- Resource pool and qualification/document status.
- Bulk upload and resource-system/API integration center.
- Availability/capacity calendar.
- Opportunities and client requests.
- Resource proposal/assignment workflow.
- Active inspections, reports, NCRs, and history.
- Client contracts and commercial visibility.
- Utilization, revenue/spend, quality, schedule, and geographic analytics.
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
- API/ERP/procurement/Power BI/resource-management integrations.
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
- Changes to inspector/agency compensation or platform fees.
- Material matching/eligibility/business-rule changes, including enforcement of client-agency sourcing restrictions.
- Production API credentials/integration security.
- Anything that could expose PII, confidential client/agency data, or inspector identity improperly.

## Definition of done
A change is not done until:
- TypeScript passes.
- Unit/regression tests pass.
- Migration checks pass when applicable.
- Production build succeeds.
- Synthetic-data QA passes.
- Relevant Vercel deployment is healthy.
- No known regression to client/agency/inspector demo parity.
- DEVELOPMENT_LOG.md is updated for meaningful work.
