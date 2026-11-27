## MODIFIED Requirements

### Requirement: Inquiries and activity

The Academy SHALL validate consent, contact details and referenced offers or practice sessions for inquiries and accept ecosystem activity only from an authorized machine integration. A valid inquiry SHALL be forwarded to the configured team notification channel promptly, and the visitor SHALL be told whether it was forwarded or only captured locally.

#### Scenario: Valid inquiry

- **WHEN** a visitor consents to contact and requests help for a known program, package or active practice session
- **THEN** the request retains the verified context, source and distinct marketing preference. The managed store queues notification with the inquiry and attempts delivery right after responding; the scheduled delivery retries failures.

#### Scenario: Team notification

- **WHEN** the notification webhook receives an inquiry
- **THEN** the team's Telegram group receives the visitor's name, contact, program, package, topic, comment and source.

#### Scenario: Visitor confirmation

- **WHEN** an inquiry is accepted where a notification webhook is configured
- **THEN** the visitor sees that the inquiry was received. Only an environment without a webhook shows that the inquiry was captured locally.

#### Scenario: Bot or inconsistent request

- **WHEN** the form's honeypot is filled or the specified package does not belong to the specified offer
- **THEN** the honeypot receives a success response without persisting the request, and a mismatched offer or package is rejected.

#### Scenario: Imported customer event

- **WHEN** a trusted source submits course, practice or room activity
- **THEN** known references are validated. A source/event identifier updates only for newer data; studio booking activity remains distinct from a payment.
