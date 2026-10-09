alter table academy.courses add column if not exists sanity_id text unique;
alter table academy.releases add column if not exists sanity_id text;
alter table academy.media add column if not exists metadata jsonb not null default '{}';
alter table academy.lesson_progress add column if not exists last_active_at timestamptz;
insert into academy.migrations(version) values('202610090002') on conflict do nothing;
