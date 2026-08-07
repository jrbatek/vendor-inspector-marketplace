# Supabase migrations

Place every new production database change in this directory.

## Filename format

Use a UTC timestamp followed by a short description:

```text
YYYYMMDDHHMMSS_description.sql
```

Example:

```text
20260806210000_add_client_messages.sql
```

## Rules

- Create one migration per logical database change.
- Prefer `begin; ... commit;` for transactional changes.
- Use `if exists` and `if not exists` where reruns should be safe.
- Do not edit a migration after it has been applied.
- Add a new corrective migration instead.
- Document destructive operations clearly.
- Keep seed/demo data separate from production schema migrations.

## Applying migrations

Use the GitHub Actions workflow named **Apply Supabase migrations**.

The workflow is manual and requires typing `APPLY`. This prevents an accidental database change from running solely because code was pushed.
