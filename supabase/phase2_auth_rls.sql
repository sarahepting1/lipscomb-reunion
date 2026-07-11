-- Lipscomb Family Reunion — Phase 2 RLS
-- Run this once against your Supabase project (SQL Editor -> paste -> Run).

alter table people enable row level security;
alter table marriages enable row level security;
alter table parent_child enable row level security;
alter table submissions enable row level security;

-- Logged-in family members can see everything in these three tables.
create policy "authenticated_select_people" on people
  for select to authenticated using (true);

create policy "authenticated_select_marriages" on marriages
  for select to authenticated using (true);

create policy "authenticated_select_parent_child" on parent_child
  for select to authenticated using (true);

-- Public view: deceased/presumed_deceased only, no address columns.
-- Runs as the view owner, so it can read `people` (which anon otherwise
-- cannot) and applies its own row/column restrictions before exposing data.
create or replace view people_public as
select
  id, name, aka, sex,
  birth_date, birth_date_raw, birth_year, birth_location,
  death_date, death_date_raw, death_year, death_location,
  status
from people
where status in ('deceased', 'presumed_deceased');

grant select on people_public to anon, authenticated;
