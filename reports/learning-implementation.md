# Learning platform implementation

Approved scope: email-code accounts, administrator delegation, private course authoring, protected video/files, intelligent progress, package access, Zoom sessions and immediate paid fulfillment. The shared cashbox and WayForPay financial operations belong to the existing `ps-booking` repository, per the owner's correction on 9 October 2026. Academy links there and keeps only its purchase/access records. See `docs/PS_BOOKING_BOUNDARY.md`.

## Delivery status

- Foundation: PostgreSQL schema, migration/import commands, Supabase identity/session integration, administrator bootstrap and delegation, entitlement snapshots and atomic payment fulfillment implemented
- PostgreSQL-backed integration tests cover identity, grants, refund isolation and progress rules
- Course authoring, media, student/admin UI and deployment verification remain in progress
- Inspected ps-booking's existing Academy product mappings, financial reports and manager-session boundary; removed the duplicate Academy finance implementation and merchant-wide sync job

Production requires configured Supabase, Sanity learning dataset, Mux, Resend, WayForPay and a server host. No service credentials or live customer records belong in this repository.
