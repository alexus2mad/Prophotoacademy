# Inquiry delivery — 27 November 2026

## Where contact-form inquiries go

Every public contact form posts to `/api/inquiries`. The inquiry is stored in
the Academy database (`academy.inquiries`) with a notification queue entry
(`academy.outbox`). It is sent right after the response, and the five-minute
timer retries failures. On production the queue posts to the Make webhook
`webflow_payment_form`, whose scenario "Integration Webhooks, Telegram Bot"
(4539028) now has an «Inquiry» route that posts to the Telegram group
«Реєстрація на курс» through `@WebflowCourseForms_Bot`. Staging has no webhook
and only stores inquiries. Administrators see them at `/admin/inquiries`.

## Fixed

- The Make scenario only routed payment events, so inquiries were accepted and
  dropped. The new route posts the name, contact, program, package, comment,
  source and time. The 14 and 23 November production inquiries were requeued
  and posted.
- Production visitors were told their inquiry was saved in a demonstration
  mode. They now see «Дякуємо за заявку» wherever a webhook is configured.
- Inquiries waited up to five minutes; they are now sent immediately.

## Release

Staging, then production, run `3c534c2f8f1624f20ef8a0c5f70ff9a6e297219f`, with
`83fd33e52eaa3a0cf3378575c18d9d09989dd2e7` as the rollback. The candidate and
public checks covered health, the administrator inquiry route and the
honeypot response. A labelled production test inquiry from the Visual content
page reached Telegram in the same second.
