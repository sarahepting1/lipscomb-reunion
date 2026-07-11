-- Lipscomb Family Reunion — Phase 7 recipe corrections
-- Run this once against your Supabase project (SQL Editor -> paste -> Run).

alter table submissions drop constraint if exists submissions_event_type_check;

alter table submissions add constraint submissions_event_type_check
  check (event_type in ('birth','death','marriage','address_update','correction','recipe_correction'));

-- Re-run approve_submission with a recipe_correction branch added (recipes
-- live in src/data/recipes.ts, not the database, so there's no structured
-- field to apply automatically -- same as the free-text 'correction' type,
-- approving just marks it reviewed so Sarah can edit the file manually).
create or replace function approve_submission(p_submission_id uuid)
returns void
language plpgsql
as $$
declare
  v_sub submissions%rowtype;
  v_payload jsonb;
  v_new_id text;
  v_parent jsonb;
  v_person1_sex text;
  v_person2_sex text;
  v_husband_id text;
  v_husband_name text;
  v_wife_id text;
  v_wife_name text;
begin
  select * into v_sub from submissions where id = p_submission_id for update;
  if not found then
    raise exception 'Submission % not found', p_submission_id;
  end if;
  if v_sub.status <> 'pending' then
    raise exception 'Submission % is not pending (status: %)', p_submission_id, v_sub.status;
  end if;

  v_payload := v_sub.payload;

  if v_sub.event_type = 'death' then
    update people
    set death_date = nullif(v_payload->>'death_date', '')::date,
        death_date_raw = nullif(v_payload->>'death_date', ''),
        death_year = extract(year from nullif(v_payload->>'death_date', '')::date)::int,
        death_location = nullif(v_payload->>'location', ''),
        status = 'deceased',
        updated_at = now()
    where id = v_payload->>'person_id';
    if not found then
      raise exception 'Cannot approve: no matched person for this death submission';
    end if;

  elsif v_sub.event_type = 'birth' then
    select 'P' || lpad((max(substring(id from 2))::int + 1)::text, 4, '0')
      into v_new_id
      from people;

    insert into people (id, name, birth_date, birth_date_raw, birth_year, birth_location, status)
    values (
      v_new_id,
      v_payload->>'child_name',
      nullif(v_payload->>'birth_date', '')::date,
      nullif(v_payload->>'birth_date', ''),
      extract(year from nullif(v_payload->>'birth_date', '')::date)::int,
      nullif(v_payload->>'location', ''),
      'presumed_living'
    );

    for v_parent in select * from jsonb_array_elements(coalesce(v_payload->'parents', '[]'::jsonb))
    loop
      if (v_parent->>'name') is not null then
        insert into parent_child (parent_id, parent_name, child_id, child_name, relationship)
        values (v_parent->>'id', v_parent->>'name', v_new_id, v_payload->>'child_name', 'Natural');
      end if;
    end loop;

  elsif v_sub.event_type = 'marriage' then
    if (v_payload->>'person1_id') is not null then
      select sex into v_person1_sex from people where id = v_payload->>'person1_id';
    end if;
    if (v_payload->>'person2_id') is not null then
      select sex into v_person2_sex from people where id = v_payload->>'person2_id';
    end if;

    -- Default person1 -> husband, person2 -> wife; swap if sex tells us otherwise.
    if v_person1_sex = 'Female' and (v_person2_sex is null or v_person2_sex = 'Male') then
      v_husband_id := v_payload->>'person2_id'; v_husband_name := v_payload->>'person2_name';
      v_wife_id := v_payload->>'person1_id'; v_wife_name := v_payload->>'person1_name';
    else
      v_husband_id := v_payload->>'person1_id'; v_husband_name := v_payload->>'person1_name';
      v_wife_id := v_payload->>'person2_id'; v_wife_name := v_payload->>'person2_name';
    end if;

    insert into marriages (husband_id, husband_name, wife_id, wife_name, marriage_date, marriage_date_raw)
    values (
      v_husband_id, v_husband_name, v_wife_id, v_wife_name,
      nullif(v_payload->>'marriage_date', '')::date, nullif(v_payload->>'marriage_date', '')
    );

  elsif v_sub.event_type = 'address_update' then
    if (v_payload->>'person_id') is null then
      raise exception 'Cannot approve: no matched person for this address update';
    end if;
    update people
    set street = nullif(v_payload->>'street', ''),
        city = nullif(v_payload->>'city', ''),
        state = nullif(v_payload->>'state', ''),
        zip = nullif(v_payload->>'zip', ''),
        updated_at = now()
    where id = v_payload->>'person_id';
    if not found then
      raise exception 'Cannot approve: no matched person for this address update';
    end if;

  elsif v_sub.event_type = 'correction' then
    -- Free-text corrections have no structured field to apply automatically.
    -- Approving just marks it reviewed so Sarah can action it manually.
    null;

  elsif v_sub.event_type = 'recipe_correction' then
    -- Recipes live in src/data/recipes.ts, not the database. Approving just
    -- marks it reviewed so Sarah can edit the file manually.
    null;

  else
    raise exception 'Unknown event_type: %', v_sub.event_type;
  end if;

  update submissions
  set status = 'approved', reviewed_at = now()
  where id = p_submission_id;
end;
$$;
