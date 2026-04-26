-- FormIQ baseline schema
create table if not exists profiles (
  id uuid references auth.users primary key,
  created_at timestamptz default now(),
  age int,
  height_cm float,
  weight_kg float,
  biological_sex text check (biological_sex in ('male','female','other')),
  dominant_side text default 'right' check (dominant_side in ('left','right')),
  body_fat_pct float,
  experience_level text check (experience_level in ('beginner','intermediate','advanced')),
  years_training float default 0,
  days_per_week int default 3,
  equipment text[] default array['bodyweight'],
  primary_goal text check (primary_goal in ('strength','hypertrophy','fat_loss','endurance','mobility','general')),
  target_weight_kg float,
  goal_timeline_weeks int,
  job_type text check (job_type in ('sedentary','lightly_active','active','manual')),
  nutrition_approach text check (nutrition_approach in ('surplus','maintenance','deficit','untracked')),
  onboarding_complete boolean default false,
  onboarding_step int default 0
);

create table if not exists injuries (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  created_at timestamptz default now(),
  body_region text check (body_region in ('left_knee','right_knee','lower_back','upper_back','left_shoulder','right_shoulder','left_hip','right_hip','left_ankle','right_ankle','left_wrist','right_wrist','neck')),
  severity text check (severity in ('minor','moderate','surgical')),
  status text check (status in ('active','healed','chronic')),
  description text,
  year_occurred int,
  contraindicated_exercises text[],
  modified_exercises jsonb,
  required_mobility_drills text[]
);

create table if not exists daily_checkins (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  date date default current_date,
  wellbeing_score int check (wellbeing_score between 1 and 10),
  sleep_hours float,
  sleep_quality int check (sleep_quality between 1 and 10),
  stress_level int check (stress_level between 1 and 10),
  pain_regions text[],
  notes text,
  recovery_score int,
  recovery_summary text,
  recommended_intensity text check (recommended_intensity in ('full','moderate','light','rest')),
  unique(user_id, date)
);

create table if not exists programs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  created_at timestamptz default now(),
  week_number int,
  is_active boolean default true,
  program_json jsonb not null,
  generation_rationale text,
  adaptations_made text[]
);

create table if not exists sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  started_at timestamptz default now(),
  ended_at timestamptz,
  program_id uuid references programs(id),
  day_label text,
  total_reps int default 0,
  avg_form_score float,
  session_form_score float,
  perceived_exertion int check (perceived_exertion between 1 and 10),
  session_summary text,
  next_session_notes text
);

create table if not exists exercise_sets (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references sessions(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  created_at timestamptz default now(),
  exercise_name text not null,
  exercise_category text,
  set_number int,
  reps_completed int,
  weight_kg float,
  duration_seconds int,
  avg_form_score float,
  min_form_score float,
  rep_scores float[],
  avg_angles jsonb,
  asymmetry_detected boolean default false,
  asymmetry_details jsonb,
  injury_risk_flagged boolean default false,
  injury_risk_reason text,
  form_errors text[],
  ai_coaching_note text
);

create table if not exists asymmetry_log (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  logged_at timestamptz default now(),
  exercise_name text,
  joint text,
  side text check (side in ('left','right')),
  angle float,
  delta_from_opposite float,
  session_id uuid references sessions(id)
);

-- Temporary table used by current video prototype persistence.
create table if not exists video_exercise_sets (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  exercise_name text not null,
  reps_completed int,
  avg_form_score float,
  rep_scores float[]
);

alter table profiles enable row level security;
alter table injuries enable row level security;
alter table daily_checkins enable row level security;
alter table programs enable row level security;
alter table sessions enable row level security;
alter table exercise_sets enable row level security;
alter table asymmetry_log enable row level security;
alter table video_exercise_sets enable row level security;

create policy "own data" on profiles for all using (auth.uid() = id);
create policy "own data" on injuries for all using (auth.uid() = user_id);
create policy "own data" on daily_checkins for all using (auth.uid() = user_id);
create policy "own data" on programs for all using (auth.uid() = user_id);
create policy "own data" on sessions for all using (auth.uid() = user_id);
create policy "own data" on exercise_sets for all using (auth.uid() = user_id);
create policy "own data" on asymmetry_log for all using (auth.uid() = user_id);
create policy "insert/read demo video sets" on video_exercise_sets for all using (true) with check (true);
