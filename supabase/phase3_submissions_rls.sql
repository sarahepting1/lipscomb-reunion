-- Lipscomb Family Reunion — Phase 3 RLS
-- Run this once against your Supabase project (SQL Editor -> paste -> Run).

create policy "authenticated_insert_submissions" on submissions
  for insert to authenticated with check (true);
