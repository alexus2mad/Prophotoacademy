# Food course corrections — 20 November 2026

Source `b2be1e25381c1b7b71806da05f4ee64f3a65eb2b` applies the owner's corrections
to `/food-product-photography`:

- The course lasts 12 weeks; the diploma week is now week 12.
- The installment caption reads «Є оплата частинами» on every page. In the Creator
  layout (food and Content Creator) the notice sits under each package price.
- The works filter lists «На телефон» first and opens on it for the food course.
- The works are the owner's Drive gallery: 31 phone photos in the owner's
  screenshot order and 14 camera photos in Drive file-name order.

677 tests, architecture, TypeScript, formatting, content validation, social
cards and the production build passed. Candidate and live checks on both
environments verified the heroes, the installment caption, all six checkout
forms (GET only, no orders) and payment modes (staging mock, production
WayForPay).

Staging and production retain `ec1c3797548ced4b5d01f47210f5a1dbfd539d76` as the
single rollback; `f8a8c1eb058ffc30fb8946f4852f9fc45e4ed9e7` was pruned. Transfer
and builder copies of this release were removed.
