# InspectSource Free Automation

This repository uses free GitHub Actions plus the existing GitHub-to-Vercel integration.

## What is automated

### Application validation

`.github/workflows/validate.yml` runs automatically on pushes and pull requests.

It performs:

1. Dependency installation
2. TypeScript validation
3. A full Next.js production build

A red workflow means the change should not be treated as release-ready.

### Vercel deployment

Vercel remains connected directly to the `main` branch. A successful push to `main` triggers the existing Vercel deployment automatically.

### Supabase migrations

`.github/workflows/supabase-migrations.yml` is intentionally manual for safety. It applies pending files in `supabase/migrations/` only after a user types `APPLY`.

Required GitHub repository secrets:

- `SUPABASE_ACCESS_TOKEN`
- `SUPABASE_PROJECT_REF`
- `SUPABASE_DB_PASSWORD`

The migration workflow should remain manual until a separate staging database exists.

### GitHub releases

`.github/workflows/release.yml` creates a versioned GitHub release with automatically generated notes from the current `main` branch.

## Standard feature workflow

1. Create a feature branch.
2. Update code and add a new migration when needed.
3. Open a pull request.
4. Wait for the validation workflow to pass.
5. Merge into `main`.
6. Vercel deploys automatically.
7. Run the Supabase migration workflow only when the release includes a migration.
8. Test the affected production pages.
9. Create a GitHub release when the feature is confirmed.

## Migration rules

- Add new migrations under `supabase/migrations/`.
- Use filenames such as `20260806210000_add_client_messages.sql`.
- Never edit a migration after it has been applied to production.
- Add a new corrective migration instead.
- Use transactions where practical.
- Make destructive changes explicit and reversible.

## Cost

GitHub Actions is free within the repository's available allowance. Vercel and Supabase remain on their current free plans while InspectSource is in development.
