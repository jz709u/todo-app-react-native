create table if not exists public.goals (
  id text primary key,
  user_id uuid not null,
  title text not null,
  abstract_goal text not null,
  status text not null,
  constraints jsonb not null default '{}'::jsonb,
  target_date bigint,
  active_plan_id text,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.plans (
  id text primary key,
  goal_id text not null references public.goals(id) on delete cascade,
  status text not null,
  summary text not null,
  assumptions jsonb not null default '[]'::jsonb,
  risks jsonb not null default '[]'::jsonb,
  version integer not null default 1,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.plan_steps (
  id text primary key,
  plan_id text not null references public.plans(id) on delete cascade,
  title text not null,
  description text,
  step_order integer not null,
  status text not null,
  approval_state text not null,
  depends_on_step_ids jsonb not null default '[]'::jsonb,
  estimated_minutes integer,
  priority text,
  suggested_due_date bigint,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.tasks (
  id text primary key,
  goal_id text not null references public.goals(id) on delete cascade,
  plan_step_id text references public.plan_steps(id) on delete set null,
  title text not null,
  status text not null,
  priority text not null,
  due_date bigint,
  scheduled_start bigint,
  scheduled_end bigint,
  completed_at bigint,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.approval_events (
  id uuid primary key default gen_random_uuid(),
  plan_step_id text not null references public.plan_steps(id) on delete cascade,
  user_id uuid not null,
  approval_state text not null,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.replan_events (
  id text primary key,
  goal_id text not null references public.goals(id) on delete cascade,
  plan_id text not null references public.plans(id) on delete cascade,
  trigger text not null,
  reason text not null,
  metadata jsonb,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists goals_user_id_idx on public.goals(user_id);
create index if not exists plans_goal_id_idx on public.plans(goal_id);
create index if not exists plan_steps_plan_id_idx on public.plan_steps(plan_id);
create index if not exists tasks_goal_id_idx on public.tasks(goal_id);
create index if not exists tasks_plan_step_id_idx on public.tasks(plan_step_id);
