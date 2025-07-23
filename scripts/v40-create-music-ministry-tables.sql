-- Music Ministry Tables and RLS Policies

-- 1. music_songs
create table if not exists music_songs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  artist text,
  composer text,
  arranger text,
  key text,
  tempo text,
  bpm integer,
  time_signature text,
  difficulty text,
  genre text,
  language text,
  tags text[],
  duration integer,
  is_public_domain boolean default false,
  created_by uuid references auth.users(id),
  created_at timestamptz default now()
);

-- 2. music_setlists
create table if not exists music_setlists (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  date date,
  service_type text,
  theme text,
  status text,
  songs jsonb,
  total_duration integer,
  created_by uuid references auth.users(id),
  created_at timestamptz default now()
);

-- 3. music_musicians
create table if not exists music_musicians (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  instruments text[],
  voice_parts text[],
  skill_level text,
  availability jsonb,
  preferences jsonb,
  is_active boolean default true,
  joined_at timestamptz default now(),
  created_by uuid references auth.users(id),
  created_at timestamptz default now()
);

-- 4. music_rehearsals
create table if not exists music_rehearsals (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  date date,
  start_time text,
  end_time text,
  location text,
  setlist_id uuid references music_setlists(id),
  attendees uuid[],
  agenda jsonb,
  notes text,
  recordings text[],
  status text,
  created_by uuid references auth.users(id),
  created_at timestamptz default now()
);

-- Enable RLS
alter table music_songs enable row level security;
alter table music_setlists enable row level security;
alter table music_musicians enable row level security;
alter table music_rehearsals enable row level security;

-- RLS: Allow authenticated users to read all
create policy "Allow read for authenticated users" on music_songs for select using (auth.role() = 'authenticated');
create policy "Allow read for authenticated users" on music_setlists for select using (auth.role() = 'authenticated');
create policy "Allow read for authenticated users" on music_musicians for select using (auth.role() = 'authenticated');
create policy "Allow read for authenticated users" on music_rehearsals for select using (auth.role() = 'authenticated');

-- RLS: Allow users to insert/update/delete their own records
create policy "Allow insert for authenticated users" on music_songs for insert with check (auth.role() = 'authenticated');
create policy "Allow update for owner" on music_songs for update using (created_by = auth.uid()::uuid);
create policy "Allow delete for owner" on music_songs for delete using (created_by = auth.uid()::uuid);

create policy "Allow insert for authenticated users" on music_setlists for insert with check (auth.role() = 'authenticated');
create policy "Allow update for owner" on music_setlists for update using (created_by = auth.uid()::uuid);
create policy "Allow delete for owner" on music_setlists for delete using (created_by = auth.uid()::uuid);

create policy "Allow insert for authenticated users" on music_musicians for insert with check (auth.role() = 'authenticated');
create policy "Allow update for owner" on music_musicians for update using (created_by = auth.uid()::uuid);
create policy "Allow delete for owner" on music_musicians for delete using (created_by = auth.uid()::uuid);

create policy "Allow insert for authenticated users" on music_rehearsals for insert with check (auth.role() = 'authenticated');
create policy "Allow update for owner" on music_rehearsals for update using (created_by = auth.uid()::uuid);
create policy "Allow delete for owner" on music_rehearsals for delete using (created_by = auth.uid()::uuid); 