-- Keep the previous state for audit and rollback; no legacy observations are deleted.
create table if not exists academy.progress_policy_backup (
 user_id uuid not null, course_id text not null, lesson_id text not null,
 previous_row jsonb not null, backed_up_at timestamptz not null default now(),
 primary key(user_id,course_id,lesson_id)
);
create table if not exists academy.quiz_attempts (
 user_id uuid not null references academy.profiles(id), event_id uuid not null,
 course_id text not null references academy.courses(id), lesson_id text not null,
 quiz_id text not null, revision integer not null, result jsonb not null,
 submitted_at timestamptz not null default now(), primary key(user_id,event_id)
);
alter table academy.progress_policy_backup enable row level security;
alter table academy.quiz_attempts enable row level security;
revoke all on academy.progress_policy_backup, academy.quiz_attempts from public;
-- Production uses a restricted server role rather than the schema owner.
-- It can append/read audit evidence, but cannot update or delete these records.
do $$
begin
 if exists(select 1 from pg_roles where rolname='prophoto_academy_runtime') then
  grant select,insert on academy.progress_policy_backup, academy.quiz_attempts to prophoto_academy_runtime;
  if not exists(select 1 from pg_policies where schemaname='academy' and tablename='progress_policy_backup' and policyname='academy_server') then
   create policy academy_server on academy.progress_policy_backup for all to prophoto_academy_runtime using(true) with check(true);
  end if;
  if not exists(select 1 from pg_policies where schemaname='academy' and tablename='quiz_attempts' and policyname='academy_server') then
   create policy academy_server on academy.quiz_attempts for all to prophoto_academy_runtime using(true) with check(true);
  end if;
 end if;
end $$;
insert into academy.migrations(version) values('202610130001') on conflict do nothing;
