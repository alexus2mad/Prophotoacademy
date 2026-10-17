-- Managers may delete promo codes that no order has used; used codes are only deactivated.
do $$
begin
 if exists(select 1 from pg_roles where rolname='prophoto_academy_runtime') then
  grant delete on academy.promo_codes to prophoto_academy_runtime;
 end if;
end $$;
insert into academy.migrations(version) values('202610170002') on conflict do nothing;
