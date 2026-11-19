# Desktop hero course action — 20 November 2026

Source `ec1c3797548ced4b5d01f47210f5a1dbfd539d76` restores the red «Хочу на курс»
action before «Програма» in the Content Creator and food course heroes on
desktop, as before `62c7282`. Phones (≤760px) keep it only in the fixed bottom
bar, so it appears once at every width.

674 tests, architecture, TypeScript, formatting and the production build passed.
Candidate and live checks on both environments verified both hero actions, the
desktop-only wrapper, all six checkout forms (GET only, no orders) and payment
modes. Production was checked in the browser at desktop and 390px widths.

Staging and production retain `f8a8c1eb058ffc30fb8946f4852f9fc45e4ed9e7` as the
single rollback; `dfcd7dcad8cbfa196e66eef7a1b9af5039bd7d7c` was pruned. Old
per-release transfer folders and helper copies were removed from the application
host and the isolated builder, keeping only this release's scope. Release
journals and rollback records in `/etc` were kept.
