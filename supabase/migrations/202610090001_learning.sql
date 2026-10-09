-- Application tables are server-owned. No browser API can read private learning or finance data.
create schema if not exists academy;
create table if not exists academy.migrations (version text primary key, applied_at timestamptz not null default now());
create table if not exists academy.profiles (
 id uuid primary key, email text not null unique check (email=lower(trim(email))),
 name text not null default '', role text not null default 'student' check(role in ('student','admin')),
 verified_at timestamptz not null, created_at timestamptz not null default now()
);
create table if not exists academy.settings (key text primary key, value jsonb not null);
create table if not exists academy.admin_invitations (
 email text primary key, invited_by uuid not null references academy.profiles(id), created_at timestamptz not null default now(), claimed_at timestamptz
);
create table if not exists academy.audit (
 id uuid primary key default gen_random_uuid(), actor_id uuid, action text not null, target text not null,
 reason text not null default '', before_value jsonb, after_value jsonb, created_at timestamptz not null default now()
);
create table if not exists academy.courses (
 id text primary key, program_id text not null unique, title text not null, cover text not null default '',
 active_release_id text, created_at timestamptz not null default now()
);
create table if not exists academy.releases (
 id text primary key, course_id text not null references academy.courses(id), version integer not null,
 manifest jsonb not null, published_at timestamptz not null default now(), unique(course_id,version)
);
create table if not exists academy.package_rules (
 offering_id text not null, package_id text not null, course_id text not null references academy.courses(id),
 release_id text not null references academy.releases(id), lesson_ids jsonb not null,
 access_months integer check(access_months>0), starts_at timestamptz, primary key(offering_id,package_id)
);
create table if not exists academy.orders (
 id text primary key, token_hash text not null unique, idempotency_key text not null unique,
 fingerprint text not null, data jsonb not null, created_at timestamptz not null default now()
);
create table if not exists academy.transactions (
 id uuid primary key default gen_random_uuid(), merchant text not null, reference text not null,
 business text check(business in ('academy','hub')), order_id text references academy.orders(id),
 email text, customer_name text not null default '', product_title text not null default '',
 program_id text, package_id text, amount_minor bigint not null check(amount_minor>=0),
 refunded_minor bigint not null default 0 check(refunded_minor>=0 and refunded_minor<=amount_minor),
 fee_minor bigint, currency text not null, status text not null,
 paid_at timestamptz, created_at timestamptz not null default now(), synced_at timestamptz not null default now(),
 unique(merchant,reference)
);
create table if not exists academy.payment_events (
 id text primary key, transaction_id uuid references academy.transactions(id), status text not null,
 created_at timestamptz not null default now()
);
create table if not exists academy.grants (
 id uuid primary key default gen_random_uuid(), user_id uuid references academy.profiles(id), email text not null,
 course_id text not null references academy.courses(id), release_id text not null references academy.releases(id),
 lesson_ids jsonb not null, package_name text not null, source_order_id text unique references academy.orders(id),
 source text not null check(source in ('purchase','admin','migration')), offering_id text,
 starts_at timestamptz not null default now(), expires_at timestamptz, revoked_at timestamptz, reason text,
 created_at timestamptz not null default now(), check(expires_at is null or expires_at>starts_at)
);
create index if not exists grants_email_idx on academy.grants(email);
create index if not exists transactions_email_idx on academy.transactions(email);
create table if not exists academy.lesson_progress (
 user_id uuid not null references academy.profiles(id), course_id text not null references academy.courses(id), lesson_id text not null,
 state jsonb not null default '{}', completed_at timestamptz, completion_source text check(completion_source in ('automatic','student','admin')),
 updated_at timestamptz not null default now(), primary key(user_id,course_id,lesson_id)
);
create table if not exists academy.progress_events (
 user_id uuid not null, event_id uuid not null, received_at timestamptz not null default now(), primary key(user_id,event_id)
);
create table if not exists academy.progress_sessions (
 id uuid primary key, user_id uuid not null, lesson_id text not null, last_seen timestamptz not null default now(),
 sequence integer not null default 0
);
create table if not exists academy.media (
 id uuid primary key default gen_random_uuid(), course_id text not null references academy.courses(id),
 kind text not null check(kind in ('video','image','pdf','file')), title text not null,
 provider_id text, object_path text, playback_id text, mime text not null,
 status text not null default 'uploading' check(status in ('uploading','processing','ready','failed')),
 duration numeric, page_count integer, created_by uuid not null, created_at timestamptz not null default now()
);
create table if not exists academy.live_sessions (
 id uuid primary key default gen_random_uuid(), course_id text not null references academy.courses(id), lesson_id text not null,
 offering_id text, title text not null, zoom_url text not null, starts_at timestamptz not null, ends_at timestamptz not null,
 timezone text not null default 'Europe/Kyiv', status text not null default 'scheduled' check(status in ('scheduled','rescheduled','canceled')),
 recording_media_id uuid references academy.media(id), check(ends_at>starts_at)
);
create table if not exists academy.attendance (
 session_id uuid not null references academy.live_sessions(id), user_id uuid not null references academy.profiles(id),
 attended boolean not null, recorded_by uuid not null, recorded_at timestamptz not null default now(), primary key(session_id,user_id)
);
create table if not exists academy.refunds (
 id uuid primary key, transaction_id uuid not null references academy.transactions(id), actor_id uuid not null,
 amount_minor bigint not null check(amount_minor>0), baseline_minor bigint not null,
 reason text not null, state text not null check(state in ('pending','confirmed','failed','uncertain')),
 failure text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists academy.inquiries (id text primary key, data jsonb not null, created_at timestamptz not null default now());
create table if not exists academy.customer_activity (id text primary key, data jsonb not null);
create table if not exists academy.outbox (
 id text primary key, kind text not null, data jsonb not null, attempts integer not null default 0,
 next_attempt timestamptz not null default now(), state text not null default 'pending',
 claim_until timestamptz, claim_token uuid, last_error text
);
create table if not exists academy.rate_limits (key text primary key, count integer not null, expires timestamptz not null);
create table if not exists academy.sync_runs (
 id uuid primary key default gen_random_uuid(), merchant text not null, started_at timestamptz not null default now(),
 finished_at timestamptz, status text not null default 'running', records integer not null default 0, error text
);
-- Defense in depth: custom schema is not exposed through PostgREST; RLS has no public policies.
do $$ declare t record; begin
 for t in select tablename from pg_tables where schemaname='academy' loop
  execute format('alter table academy.%I enable row level security',t.tablename);
 end loop;
end $$;
revoke all on schema academy from public;
revoke all on all tables in schema academy from public;
insert into academy.migrations(version) values('202610090001') on conflict do nothing;
