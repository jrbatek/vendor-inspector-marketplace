# InspectSource v1.1

A Next.js and Supabase marketplace for industrial vendor inspection services.

## Current product capabilities

- Twelve-step inspector profile wizard
- Normalized equipment, activity, NDT, certification, code, industry, language,
  travel, software, training, rate, and availability data
- Public inspector profiles
- Natural-language inspector search
- Explainable, deterministic match ranking
- Client availability requests
- Client dashboard with search and inquiry history
- Inspector inquiry dashboard with status updates
- Client/inspector account-role selection

## Vercel environment variables

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

Use values from the same Supabase project.

## v1.1 database update

Run this in Supabase SQL Editor:

```text
supabase/migrations/05_client_and_inspector_dashboards.sql
```

Earlier migrations are retained in your existing Supabase project. Do not rerun
older migrations against the working database unless specifically required.

## Main routes

```text
/                       Landing page
/find-inspectors        Natural-language client search
/client-dashboard       Client search and inquiry history
/inspectors             Inspector directory
/inspectors/[id]        Public inspector profile
/dashboard              Twelve-step inspector profile wizard
/inspector-inquiries    Inspector opportunity inbox
/login                  Login
/register               Role-based registration
/logout                 Logout
```

## Deployment

1. Upload the complete project contents to GitHub.
2. Run the v1.1 SQL migration in Supabase.
3. Confirm both Vercel environment variables.
4. Deploy from the GitHub `main` branch.
5. Test client and inspector accounts separately.

## Test script

### Client
1. Register as Client.
2. Open `/find-inspectors`.
3. Run a natural-language search.
4. Request availability from an inspector.
5. Open `/client-dashboard` and confirm the request appears.

### Inspector
1. Log in as an inspector.
2. Open `/inspector-inquiries`.
3. Confirm the client request appears.
4. Change the status to `viewed` or `contacted`.
5. Confirm the client dashboard reflects the new status.
