## ADDED Requirements

### Requirement: Dismissible shared Academy checkout

Academy SHALL show the selected package's existing checkout form and order summary in a shared accessible dialog with a visible close button. The checkout presentation SHALL omit a return-to-programs control.

#### Scenario: Open from an Academy offer

- **WHEN** a visitor opens an eligible course or workshop checkout from its landing or catalog
- **THEN** the dialog overlays the originating page and displays the selected package. Closing it with the cross, Escape, or browser Back returns the visitor to the originating page and its position.

#### Scenario: Open a direct checkout URL

- **WHEN** a visitor opens or reloads a checkout URL directly
- **THEN** the same dialog opens for that package. Its dismiss control returns to the associated program or workshop when known and otherwise to the Academy catalog.

#### Scenario: Proceed to the payment widget

- **WHEN** a buyer submits checkout and opens the WayForPay widget
- **THEN** the widget can receive focus and input. If the buyer closes it or payment is declined, the shared checkout dialog and its contact information are restored.
