# Vendor Inspector Marketplace V1

InspectSource — Complete Inspector Profile Wizard

This package replaces all incremental dashboard builds with one complete version.

Replace these files in GitHub:
1. app/dashboard/page.tsx
2. lib/types.ts

Commit both files together directly to main.

No new SQL is required if you already ran:
- normalized reference catalog upgrade
- core inspector profile upgrade
- profiles foreign-key repair

Included wizard steps:
1. Personal Information
2. Professional Experience
3. Equipment
4. Inspection Activities
5. NDT Methods
6. Certifications
7. Codes & Standards
8. Industries
9. Languages
10. Travel Credentials & Work Countries
11. Software & Training
12. Rates & Availability

Test sequence:
1. Wait for Vercel deployment to show Ready.
2. Log in and open /dashboard.
3. Walk through all 12 steps.
4. Save each step.
5. Refresh and verify selections reload.
6. Use Supabase Table Editor to confirm relationship tables contain rows.

Rollback:
Use GitHub commit history to restore the prior versions of app/dashboard/page.tsx and lib/types.ts.
