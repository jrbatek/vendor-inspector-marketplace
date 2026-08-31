# InspectSource Autonomous Development Protocol

## Objective
Continuously improve InspectSource with minimal product-owner interaction while protecting production, user data, and core business rules.

## Development loop
Each autonomous run should:
1. Read `PRODUCT_ROADMAP.md` and `DEVELOPMENT_LOG.md`.
2. Inspect recent GitHub changes, CI failures, Vercel failures/runtime errors, and open PRs.
3. Choose one coherent improvement with the highest user value and lowest unnecessary risk.
4. Prefer fixing broken/duplicated workflows before inventing new features.
5. Implement the smallest complete change.
6. Add or update tests.
7. Run validation including synthetic-data QA.
8. Check the Vercel preview/deployment.
9. If the change is low-risk and all checks pass, it may move to production. Otherwise leave a reviewable PR.
10. Update `DEVELOPMENT_LOG.md` with what changed, what was validated, and what should happen next.

## Product-owner interaction policy
Do not ask the product owner to choose among implementation alternatives when a clear best path exists. Make a recommendation and implement it.

Escalate only when the decision materially affects:
- pricing or inspector compensation;
- legal/commercial terms;
- authentication/security policy;
- destructive data changes;
- privacy/PII exposure;
- major marketplace selection rules;
- irreversible external infrastructure/account configuration.

## Demo/production parity
Treat demo screens as populated examples of production components. If a demo receives an improvement that belongs in the real workflow, create a corresponding production backlog item immediately. Avoid maintaining separate business logic for demo search/matching.

## Synthetic-data policy
Synthetic data must never be inserted into production. Use deterministic generated records for QA and load/performance testing. Synthetic records should include both normal and adversarial cases.

Minimum synthetic QA corpus target:
- 5,000 inspectors
- 500 client organizations
- 2,000 inspection assignments
- 15,000 inspector certifications
- 25,000 inspector equipment/industry/activity relationships
- 10,000 schedule/availability records
- 5,000 reports/findings/NCR records
- 3,000 invoice/payment records

## Required edge cases
Synthetic generation should include:
- expired and soon-to-expire credentials;
- conflicting assignments;
- unavailable inspectors;
- international/domestic/local travel constraints;
- unusual currencies;
- missing optional profile fields;
- rates above and below client caps;
- minimum-experience boundaries;
- required certifications absent/present;
- multiple suppliers and project locations;
- long-distance travel and time requirements;
- non-conformances and reinspections;
- budgets under, at, and over actual spend;
- low, average, and excellent client ratings;
- complete and incomplete inspector profiles.

## Safe autonomous shipping
A run may automatically ship only if all required checks pass and the change is clearly low-risk under `PRODUCT_ROADMAP.md`.

When uncertain, create/maintain a PR and continue working on other non-conflicting tasks rather than blocking the whole development loop.

## Never do autonomously
- delete production records;
- relax RLS/security to make a feature work;
- expose inspector identity before the designed release point;
- add hidden fees or alter compensation;
- fabricate client feedback or inspector qualifications;
- seed synthetic records into production;
- rotate or expose secrets.
