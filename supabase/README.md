# Supabase (production only)

We **do not run Supabase locally** — everything uses the **hosted/production** project.

## Applying migrations

Migrations live in `supabase/migrations/`. Apply them to production in one of these ways:

### Option A: Run SQL in Dashboard (recommended)

1. Open **[Supabase Dashboard](https://supabase.com/dashboard)** → your project → **SQL Editor**.
2. Open the migration file you need (e.g. `supabase/migrations/20260215000000_quotes_draft_category_tags_crud.sql`).
3. Copy its contents, paste into the SQL Editor, and click **Run**.

### Option B: CLI + remote link

1. **Log in** (once):  
   `supabase login`

2. **Link and push** (uses `VITE_SUPABASE_URL` from `.env`):  
   `npm run db:push`  
   This runs `scripts/supabase-push.sh`, which links the remote project and runs `supabase db push`.

## Creating a new migration

1. Add a new file under `supabase/migrations/` (e.g. `YYYYMMDDHHMMSS_description.sql`).
2. Apply it using **Option A** or **Option B** above.

## Edge Functions

Deploy to production:

```bash
supabase functions deploy <function-name> [--no-verify-jwt]
```

Secrets are set in the Dashboard or via:

```bash
supabase secrets set KEY=value
```

## Local Supabase (optional)

We don’t use `supabase start` by default. If you want a local instance later, run `supabase start`; the same migration files can be applied with `supabase db reset` or `supabase db push` after linking.
