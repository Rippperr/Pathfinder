-- Per-user progress for each role/skill roadmap step. Role and skill labels are
-- stored instead of catalog UUIDs so built-in catalog entries work as well.
create table if not exists public.user_skill_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role_title text not null,
  skill_name text not null,
  status text not null default 'not_started'
    check (status in ('not_started', 'in_progress', 'completed')),
  evidence text not null default '',
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, role_title, skill_name),
  check (char_length(role_title) between 1 and 160),
  check (char_length(skill_name) between 1 and 160),
  check (char_length(evidence) <= 2000)
);

alter table public.user_skill_progress enable row level security;

drop policy if exists "Users can view their own skill progress" on public.user_skill_progress;
create policy "Users can view their own skill progress"
  on public.user_skill_progress for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can create their own skill progress" on public.user_skill_progress;
create policy "Users can create their own skill progress"
  on public.user_skill_progress for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own skill progress" on public.user_skill_progress;
create policy "Users can update their own skill progress"
  on public.user_skill_progress for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own skill progress" on public.user_skill_progress;
create policy "Users can delete their own skill progress"
  on public.user_skill_progress for delete to authenticated
  using (auth.uid() = user_id);

grant select, insert, update, delete on public.user_skill_progress to authenticated;

create index if not exists user_skill_progress_user_role_idx
  on public.user_skill_progress (user_id, role_title);
