# Learning platform implementation

Approved scope: email-code accounts, administrator delegation, private course authoring, protected video/files, intelligent progress, package access, Zoom sessions, immediate paid fulfillment, and a combined Academy/Hub cashbox with refunds.

## Delivery status

- Foundation: PostgreSQL schema, migration/import commands, Supabase identity/session integration, administrator bootstrap and delegation, entitlement snapshots and atomic payment fulfillment implemented
- PostgreSQL-backed integration tests cover identity, grants, refund isolation and progress rules
- Course authoring, media, student/admin UI, reconciliation, refunds and deployment verification remain in progress

Production requires configured Supabase, Sanity learning dataset, Mux, Resend, WayForPay and a server host. No service credentials or live customer records belong in this repository.
