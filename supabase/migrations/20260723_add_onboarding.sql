alter table public.users
  add column if not exists onboarding_completed boolean not null default false;

-- Preserve the normal dashboard flow for profiles that were already completed
-- before onboarding was introduced.
update public.users
set onboarding_completed = true
where coalesce(trim(title), '') <> ''
  and coalesce(trim(experience), '') <> '';
