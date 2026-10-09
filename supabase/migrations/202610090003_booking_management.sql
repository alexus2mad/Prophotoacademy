create table if not exists academy.management_sessions (
 token_hash text primary key,user_id uuid not null references academy.profiles(id),
 verified_at timestamptz not null default now(),expires_at timestamptz not null,
 created_at timestamptz not null default now()
);
create table if not exists academy.management_nonces (
 id uuid primary key,created_at timestamptz not null default now()
);
alter table academy.management_sessions enable row level security;
alter table academy.management_nonces enable row level security;
revoke all on academy.management_sessions,academy.management_nonces from public;
insert into academy.migrations(version) values('202610090003') on conflict do nothing;
