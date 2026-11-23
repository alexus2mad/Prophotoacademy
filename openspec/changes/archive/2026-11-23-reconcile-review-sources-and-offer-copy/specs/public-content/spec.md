## ADDED Requirements

### Requirement: Accurate review destinations

The Academy SHALL identify genuine supplied review sources separately from its general review index.

#### Scenario: Original review source exists
- **WHEN** the supplied source is a valid, distinct HTTP(S) destination or internal article
- **THEN** the review links to the supplied destination as its original source.

#### Scenario: Only the reviews index or no suitable source exists
- **WHEN** a review has no suitable original source or its supplied URL resolves to the Academy reviews index
- **THEN** cards outside the index may link internally to all reviews, and the index itself omits a link for that review.
