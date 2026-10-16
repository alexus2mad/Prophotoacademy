-- Manager-defined discount codes. The server alone applies them; orders keep the code,
-- percentage and list price, so later edits never change an existing order.
create table if not exists academy.promo_codes (
 code text primary key check (code ~ '^[A-Z0-9_-]{3,32}$'),
 percent integer not null check (percent between 1 and 90),
 active boolean not null default true,
 starts_at timestamptz,
 expires_at timestamptz,
 max_uses integer check (max_uses > 0),
 program_ids jsonb not null default '[]'::jsonb check (jsonb_typeof(program_ids) = 'array'),
 note text not null default '' check (length(note) <= 200),
 created_by uuid references academy.profiles(id),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 check (expires_at is null or starts_at is null or expires_at > starts_at)
);
create index if not exists orders_promo_code_idx on academy.orders ((data->>'promoCode'))
 where data ? 'promoCode';
alter table academy.promo_codes enable row level security;
revoke all on academy.promo_codes from public;
do $$
begin
 if exists(select 1 from pg_roles where rolname='prophoto_academy_runtime') then
  grant select,insert,update on academy.promo_codes to prophoto_academy_runtime;
  if not exists(select 1 from pg_policies where schemaname='academy' and tablename='promo_codes' and policyname='academy_server') then
   create policy academy_server on academy.promo_codes for all to prophoto_academy_runtime using(true) with check(true);
  end if;
 end if;
end $$;
insert into academy.migrations(version) values('202610170001') on conflict do nothing;
