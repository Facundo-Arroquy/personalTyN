-- =============================================
-- Ejecutar en Supabase > SQL Editor
-- =============================================

create table if not exists plans (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  start_date date not null,
  end_date date not null,
  routine jsonb not null default '[]',
  diet_notes text default '',
  meals_plan jsonb not null default '{}'
);

create table if not exists gym_sessions (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  date date not null,
  time_in time not null,
  time_out time,
  feeling text check (feeling in ('sobrado', 'bien', 'muy_cansado')),
  plan_id uuid references plans(id),
  notes text
);

create table if not exists gym_exercises (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references gym_sessions(id) on delete cascade,
  name text not null,
  sets jsonb not null default '[]',
  notes text
);

create table if not exists food_logs (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  date date not null,
  meal_type text check (meal_type in ('desayuno','almuerzo','merienda','cena','extra')) not null,
  description text not null,
  notes text
);

-- RLS: permitir todo (app personal sin auth)
alter table plans enable row level security;
alter table gym_sessions enable row level security;
alter table gym_exercises enable row level security;
alter table food_logs enable row level security;

create policy "Allow all" on plans for all using (true) with check (true);
create policy "Allow all" on gym_sessions for all using (true) with check (true);
create policy "Allow all" on gym_exercises for all using (true) with check (true);
create policy "Allow all" on food_logs for all using (true) with check (true);
