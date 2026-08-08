# InspectSource Autonomous Development Pipeline v1

InspectSource uses GitHub Actions, the existing GitHub-to-Vercel connection, and versioned Supabase migrations so routine development can be handled without file-by-file copy/paste.

## Operating model

The product owner describes a change. Development work is performed on a branch named `autonomous-*`. A pull request is opened. GitHub validates the change. If every validation gate passes, the autonomous pull request is eligible for automatic merge. Vercel then deploys `main`, and a production smoke workflow checks the live site.

Human intervention is reserved for product decisions, credential setup, or genuinely destructive/high-risk changes.

## Validation gate

`.github/workflows/validate.yml` runs on every pull request to `main` and every push to `main`.

It performs:

1. Dependency installation
2. Regression tests (`npm test`)
3. Supabase migration safety scan
4. TypeScript validation
5. Full Next.js production build
6. Local post-build route smoke tests

A failed gate blocks an autonomous release.

## Permanent regression tests

`tests/projectCoordinator.test.ts` contains the canonical client request used during development:

> Need two API 570 inspectors in Houston for a refinery turnaround starting September 14 for three weeks. TWIC required. Budget is $950 per day. Please send CVs and confirm availability.

The test protects inspector count, location, start date, duration, budget, API 570/TWIC recognition, ranking behavior, and anonymity expectations. Bugs fixed in production should be converted into permanent regression tests whenever practical.

## Autonomous merge gate

`.github/workflows/auto-merge.yml` runs only after the main validation workflow completes successfully.

Only pull requests whose source branch begins with `autonomous-` are eligible for automatic merge. Ordinary branches remain manual. Draft pull requests are never auto-merged.

This branch-name rule is the explicit authorization boundary for autonomous code releases.

## Vercel production deployment

Vercel remains connected to `main`. Once an autonomous pull request is merged, Vercel deploys it using the existing integration.

`.github/workflows/production-smoke.yml` then retries the live production site for several minutes and verifies the homepage, AI Project Coordinator, and inspector marketplace respond successfully and contain expected InspectSource content.

## Supabase migrations

Every database change belongs in `supabase/migrations/` as a new versioned migration. Do not paste production schema changes manually into Supabase once this pipeline is fully configured.

`.github/workflows/supabase-migrations.yml` automatically runs when migration files reach `main`. Before applying anything it:

1. Requires all three production deployment secrets
2. Runs the migration safety scanner
3. Links the configured Supabase project
4. Applies pending versioned migrations

Required GitHub repository secrets:

- `SUPABASE_ACCESS_TOKEN`
- `SUPABASE_PROJECT_REF`
- `SUPABASE_DB_PASSWORD`

If one is missing, the database workflow fails visibly rather than silently skipping a migration.

## Migration safety

`scripts/check-migrations.mjs` blocks high-risk SQL patterns such as dropping a database/schema, truncating tables, deleting all auth users, or unguarded `DROP TABLE` statements.

Destructive database work must be treated as an exceptional reviewed change instead of bypassing the guard.

## Local smoke validation

`scripts/smoke-local.mjs` starts the built Next.js application with CI-only Supabase placeholders and verifies critical routes render before a release can be considered green.

## Standard autonomous feature workflow

1. Create an `autonomous-*` branch from current `main`.
2. Implement the requested change.
3. Add/update tests for the behavior being changed.
4. Add a versioned Supabase migration when necessary.
5. Open a pull request to `main`.
6. GitHub automatically runs regression, migration-safety, type, build, and local smoke checks.
7. Failed checks are fixed on the branch and rerun.
8. A green autonomous pull request merges automatically.
9. Vercel deploys `main`.
10. Production smoke tests verify the live application.
11. If migrations were included, Supabase applies them automatically using GitHub secrets.
12. Report milestone completion and any product-level testing worth doing.

## Cost principle

Prefer free automation first. GitHub Actions uses the repository's included runner allowance. Vercel and Supabase remain on their current free tiers during development. Add paid infrastructure only when real usage or commercial requirements justify it.
