# Learning platform implementation

Approved scope: email-code accounts, administrator delegation, private course authoring, protected video/files, intelligent progress, package access, Zoom sessions and immediate paid fulfillment. The shared cashbox and WayForPay financial operations belong to the existing `ps-booking` repository, per the owner's correction on 9 October 2026. Academy links there and keeps only its purchase/access records. See `docs/PS_BOOKING_BOUNDARY.md`.

## Delivery status

- Foundation: PostgreSQL schema, migration/import commands, Supabase identity/session integration, administrator bootstrap and delegation, entitlement snapshots and atomic payment fulfillment implemented
- PostgreSQL-backed integration tests cover identity, grants, refund isolation and progress rules
- Implemented course authoring with immutable publishing, protected media adapters, student dashboard/player, Zoom scheduling and tracked reading/video/PDF progress
- Implemented student management, access controls, privileges, statistics and attendance in the separate ps-booking admin integration; Academy only retains course authoring and student-facing routes
- Database integration tests cover signed-request replay protection, current-role enforcement, recent verification, idempotent grants, revocation/restoration and preserved progress
- Synthetic demos reuse the same components; the static export excludes private routes and real backend actions
- Inspected ps-booking's existing Academy product mappings, financial reports and manager-session boundary; removed the duplicate Academy finance implementation and merchant-wide sync job

Production requires configured Supabase, Sanity learning dataset, Mux, Resend, WayForPay and a server host. No service credentials or live customer records belong in this repository.

See `docs/LEARNING_OPERATIONS.md` for activation steps and the outstanding provider-backed release checks. The management bridge does not replace the remaining payment reconciliation producer in ps-booking.

## Verification on 9 October 2026

- Academy: 73 tests passed; architecture guard, TypeScript, formatting, production build and GitHub review export passed. The review validator checked 49 exported pages and excluded private API/authoring/learning routes
- Booking integration: syntax checks and all 431 tests passed. A pre-existing customer-sorting test used past dates for its future bookings; its fixture now uses relative dates, without a change to production sorting
- Browser: synthetic booking email-code login, overview, student detail/access dialog, team controls, keyboard Escape/focus restoration; Academy dashboard, curriculum drawer, PDF pagination/text, and student preview navigation verified
- PDF/player, editor and booking team layouts checked at 360, 390, 768, 1024 and 1440 pixels, with no document-level horizontal overflow
- All browser records and credentials used in QA were synthetic and local. Actual Supabase email delivery, private Sanity/Storage, signed Mux playback, provider callbacks and production deployment remain activation checks
