-- Lipscomb Family Reunion — Phase 1 schema
-- Run this once against your Supabase project (SQL Editor -> paste -> Run).

create extension if not exists pgcrypto;

create table if not exists people (
  id text primary key,
  name text not null,
  aka text,
  sex text,
  birth_date date,
  birth_date_raw text,
  birth_year int,
  birth_location text,
  death_date date,
  death_date_raw text,
  death_year int,
  death_location text,
  street text,
  city text,
  state text,
  zip text,
  status text not null check (status in ('deceased','presumed_deceased','presumed_living','unknown')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists marriages (
  id uuid primary key default gen_random_uuid(),
  husband_id text references people(id),
  husband_name text not null,
  wife_id text references people(id),
  wife_name text,
  marriage_date date,
  marriage_date_raw text,
  ending_status text
);

create table if not exists parent_child (
  id uuid primary key default gen_random_uuid(),
  parent_id text references people(id),
  parent_name text not null,
  child_id text references people(id),
  child_name text not null,
  relationship text
);

create table if not exists submissions (
  id uuid primary key default gen_random_uuid(),
  event_type text not null check (event_type in ('birth','death','marriage','address_update','correction')),
  person_id text references people(id),
  payload jsonb not null,
  submitter_name text not null,
  submitter_contact text,
  notes text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  reviewed_at timestamptz,
  created_at timestamptz default now()
);
