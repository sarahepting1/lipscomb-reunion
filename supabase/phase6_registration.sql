-- Lipscomb Family Reunion — Phase 6 self-service registration
-- Run this once against your Supabase project (SQL Editor -> paste -> Run).

create table if not exists user_people (
  user_id uuid primary key references auth.users(id) on delete cascade,
  person_id text references people(id),
  created_at timestamptz default now()
);

alter table user_people enable row level security;

create policy "users_select_own_link" on user_people
  for select to authenticated using (auth.uid() = user_id);

create policy "users_insert_own_link" on user_people
  for insert to authenticated with check (auth.uid() = user_id);

create policy "users_update_own_link" on user_people
  for update to authenticated using (auth.uid() = user_id);
