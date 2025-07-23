-- Bible Study Module: Tables and RLS Policies

-- 1. bible_studies table
create table if not exists bible_studies (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  duration text,
  difficulty text,
  category text,
  participants integer default 0,
  rating float default 0,
  progress float default 0,
  is_enrolled boolean default false,
  created_by uuid references auth.users(id),
  created_at timestamptz default now()
);

-- 2. bible_study_lessons table
create table if not exists bible_study_lessons (
  id uuid primary key default gen_random_uuid(),
  study_id uuid references bible_studies(id) on delete cascade,
  title text not null,
  description text,
  duration integer,
  is_completed boolean default false,
  created_at timestamptz default now()
);

-- 3. bible_study_groups table
create table if not exists bible_study_groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  meeting_time text,
  is_private boolean default false,
  created_by uuid references auth.users(id),
  created_at timestamptz default now()
);

-- 4. bible_study_discussions table
create table if not exists bible_study_discussions (
  id uuid primary key default gen_random_uuid(),
  study_id uuid references bible_studies(id) on delete cascade,
  lesson_id uuid references bible_study_lessons(id) on delete set null,
  author uuid references auth.users(id),
  author_name text,
  author_avatar text,
  content text not null,
  timestamp timestamptz default now(),
  likes integer default 0
);

-- Enable RLS
alter table bible_studies enable row level security;
alter table bible_study_lessons enable row level security;
alter table bible_study_groups enable row level security;
alter table bible_study_discussions enable row level security;

-- RLS Policies: Allow authenticated users to read all
create policy "Allow read for authenticated users" on bible_studies for select using (auth.role() = 'authenticated');
create policy "Allow read for authenticated users" on bible_study_lessons for select using (auth.role() = 'authenticated');
create policy "Allow read for authenticated users" on bible_study_groups for select using (auth.role() = 'authenticated');
create policy "Allow read for authenticated users" on bible_study_discussions for select using (auth.role() = 'authenticated');

-- Drop old owner/author policies if they exist to avoid type errors
-- Studies
 drop policy if exists "Allow update for owner" on bible_studies;
 drop policy if exists "Allow delete for owner" on bible_studies;
-- Groups
 drop policy if exists "Allow update for owner" on bible_study_groups;
 drop policy if exists "Allow delete for owner" on bible_study_groups;
-- Discussions
 drop policy if exists "Allow update/delete for author" on bible_study_discussions;

-- RLS Policies: Allow users to insert/update/delete their own records
create policy "Allow insert for authenticated users" on bible_studies for insert with check (auth.role() = 'authenticated');
create policy "Allow update for owner" on bible_studies for update using (created_by = auth.uid()::uuid);
create policy "Allow delete for owner" on bible_studies for delete using (created_by = auth.uid()::uuid);

create policy "Allow insert for authenticated users" on bible_study_lessons for insert with check (auth.role() = 'authenticated');
create policy "Allow update for all" on bible_study_lessons for update using (auth.role() = 'authenticated');
create policy "Allow delete for all" on bible_study_lessons for delete using (auth.role() = 'authenticated');

create policy "Allow insert for authenticated users" on bible_study_groups for insert with check (auth.role() = 'authenticated');
create policy "Allow update for owner" on bible_study_groups for update using (created_by = auth.uid()::uuid);
create policy "Allow delete for owner" on bible_study_groups for delete using (created_by = auth.uid()::uuid);

create policy "Allow insert for authenticated users" on bible_study_discussions for insert with check (auth.role() = 'authenticated');
create policy "Allow update/delete for author" on bible_study_discussions for all using (author = auth.uid()::uuid); 