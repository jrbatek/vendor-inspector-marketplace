# InspectSource v1.1

## Added
- Client and inspector account selection during registration
- Role-aware login redirects
- Client dashboard for searches and availability requests
- Inspector inquiry dashboard with status updates
- New commercial landing page
- Expanded navigation
- Search history linked to logged-in clients
- Supabase migration for role handling and inquiry updates

## Existing features retained
- 12-step inspector profile wizard
- Public inspector profiles
- Natural-language client search
- Explainable deterministic matching

## Installation
1. Upload the complete project snapshot to GitHub.
2. In Supabase SQL Editor, run:
   `supabase/migrations/05_client_and_inspector_dashboards.sql`
3. Ensure Vercel has the existing Supabase URL and anon/publishable key.
4. Deploy and test `/`, `/client-dashboard`, and `/inspector-inquiries`.
