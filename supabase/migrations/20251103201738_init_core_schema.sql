-- ==== CORE ===============================================================
create table if not exists public."User" (
  id                serial primary key,
  name              varchar(120),
  surname           varchar(120),
  email             varchar(255) unique not null,
  password_hash     varchar(255),
  phone             varchar(40),
  birthdate         date,
  sex               varchar(20),
  height_cm         int,
  weight_kg         numeric(5,2),
  activity_level    varchar(20),
  primary_goal      varchar(30),
  dietary_prefs     jsonb,
  allergies         text[],
  role              varchar(20),
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

-- ==== MEDITATION =========================================================
create table if not exists public."MoodOption" (
  id         serial primary key,
  code       varchar(30) unique not null,
  created_at timestamptz default now()
);

create table if not exists public."MeditationPreset" (
  id           serial primary key,
  mood_code    varchar(30) not null,
  time_window  varchar(20) not null,
  inhale_sec   int not null default 5,
  hold_sec     int not null default 3,
  exhale_sec   int not null default 5,
  cycles       int not null default 6,
  title        varchar(120),
  subtitle     varchar(200),
  tips         jsonb,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now(),
  constraint meditationpreset_mood_code_fk
    foreign key (mood_code) references public."MoodOption"(code)
      on update cascade on delete restrict
);
create unique index if not exists meditationpreset_mood_time_unique
  on public."MeditationPreset"(mood_code, time_window);

-- ==== DIETA / IA =========================================================
create table if not exists public."NutritionProfile" (
  id             serial primary key,
  user_id        int not null unique references public."User"(id) on delete cascade,
  sex            varchar(10),
  age_years      int,
  height_cm      int,
  weight_kg      numeric(5,2),
  activity_level varchar(20),
  primary_goal   varchar(20),
  allergies      text[],
  dietary_prefs  jsonb,
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);

create table if not exists public."DietPlan" (
  id            serial primary key,
  user_id       int not null unique references public."User"(id) on delete cascade,
  kcal_target   int,
  macros_target jsonb,
  plan          jsonb not null,
  source        varchar(10) default 'ai',
  updated_by    varchar(50),
  updated_at    timestamptz default now(),
  created_at    timestamptz default now()
);

-- ==== ENTRENAMIENTO ======================================================
create table if not exists public."TrainerProfile" (
  id           serial primary key,
  user_id      int not null unique references public."User"(id) on delete cascade,
  bio          text,
  specialties  text[],
  social_links jsonb,
  created_at   timestamptz default now()
);

create table if not exists public."UserTrainer" (
  id          serial primary key,
  user_id     int not null references public."User"(id) on delete cascade,
  trainer_id  int not null references public."TrainerProfile"(id) on delete cascade,
  status      varchar(20),
  started_at  date,
  ended_at    date,
  created_at  timestamptz default now()
);
create index if not exists usertrainer_user_status_idx
  on public."UserTrainer"(user_id, status);

create table if not exists public."TrainingProgram" (
  id             serial primary key,
  trainer_id     int not null references public."TrainerProfile"(id) on delete cascade,
  title          varchar(200),
  description    text,
  goal           varchar(30),
  level          varchar(20),
  duration_weeks int,
  is_public      boolean default false,
  created_at     timestamptz default now()
);

create table if not exists public."Workout" (
  id         serial primary key,
  program_id int not null references public."TrainingProgram"(id) on delete cascade,
  day_number int,
  title      varchar(200),
  notes      text,
  created_at timestamptz default now()
);
create unique index if not exists workout_program_day_unique
  on public."Workout"(program_id, day_number);

create table if not exists public."Exercise" (
  id             serial primary key,
  name           varchar(200) not null,
  primary_muscle varchar(40),
  equipment      varchar(40),
  instructions   text,
  video_url      text,
  created_at     timestamptz default now()
);

create table if not exists public."WorkoutExercise" (
  id             serial primary key,
  workout_id     int not null references public."Workout"(id) on delete cascade,
  exercise_id    int not null references public."Exercise"(id) on delete restrict,
  sequence_order int,
  sets           int,
  reps           varchar(30),
  rest_sec       int,
  tempo          varchar(20),
  weight_hint    varchar(40),
  notes          text
);
create unique index if not exists workoutexercise_order_unique
  on public."WorkoutExercise"(workout_id, sequence_order);

create table if not exists public."UserProgramAssignment" (
  id          serial primary key,
  user_id     int not null references public."User"(id) on delete cascade,
  program_id  int not null references public."TrainingProgram"(id) on delete cascade,
  assigned_by int not null references public."TrainerProfile"(id) on delete set null,
  start_date  date,
  status      varchar(20),
  created_at  timestamptz default now()
);
create index if not exists userprogram_user_status_idx
  on public."UserProgramAssignment"(user_id, status);

create table if not exists public."WorkoutLog" (
  id           serial primary key,
  user_id      int not null references public."User"(id) on delete cascade,
  workout_id   int not null references public."Workout"(id) on delete restrict,
  performed_at timestamptz default now(),
  duration_min int,
  notes        text
);
create index if not exists workoutlog_user_performed_idx
  on public."WorkoutLog"(user_id, performed_at);

create table if not exists public."WorkoutSetLog" (
  id             serial primary key,
  workout_log_id int not null references public."WorkoutLog"(id) on delete cascade,
  exercise_id    int not null references public."Exercise"(id) on delete restrict,
  set_number     int,
  reps_done      int,
  weight_kg      numeric(6,2),
  rpe            numeric(3,1),
  notes          text
);
create unique index if not exists workoutsetlog_unique
  on public."WorkoutSetLog"(workout_log_id, exercise_id, set_number);
