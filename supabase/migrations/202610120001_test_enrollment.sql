-- Test enrollment is an entitlement, not a payment or an administrator grant.
alter table academy.grants drop constraint if exists grants_source_check;
alter table academy.grants add constraint grants_source_check
 check (source in ('purchase','admin','migration','test'));
create unique index if not exists orders_test_enrollment_unique on academy.orders
 ((data->'customer'->>'email'), (data->>'offeringId'), (data->>'packageId'))
 where data->>'mode'='disabled' and data->>'status'='enrolled';
insert into academy.migrations(version) values('202610120001') on conflict do nothing;
