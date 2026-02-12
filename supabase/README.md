# Supabase migrations

Migrations live in `supabase/migrations/`. The CLI tracks which have been applied on your linked project.

## First-time: log in and push

1. **Log in to Supabase CLI** (once; opens browser):

   ```bash
   supabase login
   ```

2. **Link and push** (uses `VITE_SUPABASE_URL` from `.env`):

   ```bash
   npm run db:push
   ```

   Or run the script directly: `./scripts/supabase-push.sh`

   The script reads the project ref from `.env` and runs `supabase link` then `supabase db push`.

## Create a new migration after schema changes

```bash
supabase migration new describe_your_change
# Edit the new file in supabase/migrations/
supabase db push
```

## Other useful commands

- `supabase db diff` — generate a migration from local vs remote schema
- `supabase db pull` — pull remote schema into a migration
- `supabase status` — show local Supabase status (when running `supabase start`)
