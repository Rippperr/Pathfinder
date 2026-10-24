-- Keep the public career catalog readable while limiting private data to signed-in users.
-- RLS policies remain the row-level boundary; these grants reduce the available SQL surface.

revoke all privileges on table
  public.achievements,
  public.course_skills,
  public.courses,
  public.role_skills,
  public.roles,
  public.skills,
  public.user_skill_progress,
  public.user_skills,
  public.users
from anon;

revoke all privileges on table
  public.achievements,
  public.course_skills,
  public.courses,
  public.role_skills,
  public.roles,
  public.skills,
  public.user_skill_progress,
  public.user_skills,
  public.users
from authenticated;

grant select on table
  public.course_skills,
  public.courses,
  public.role_skills,
  public.roles,
  public.skills
to anon, authenticated;

grant select, insert, update, delete on table
  public.achievements,
  public.user_skill_progress,
  public.user_skills
to authenticated;

grant select, update on table public.users to authenticated;
