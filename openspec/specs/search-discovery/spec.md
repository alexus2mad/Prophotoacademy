# search-discovery Specification

## Purpose

Help search engines and link-preview clients discover the public Academy and Hub while keeping private routes and previews out of search results.

## Requirements

### Requirement: Canonical public pages and structured identity

Public Academy pages SHALL publish canonical URLs on the configured Academy origin, Ukrainian metadata, and page-specific descriptions where supplied. Structured data shall use a consistent Academy identity.

#### Scenario: Indexable course
- **WHEN** a public course page is requested
- **THEN** its title and description use the supplied SEO values or program copy, its Course data references the homepage organization, and its breadcrumbs point to the Academy program index.

#### Scenario: Homepage organization
- **WHEN** a search client reads the Academy homepage
- **THEN** its educational organization and website are linked and describe the Academy's Ukrainian service area and its supplied location.

### Requirement: Indexability boundaries

The public sitemaps SHALL enumerate eligible destinations on the correct business origin. Private, duplicate, preview and purchase URLs shall be excluded from the Academy sitemap.

#### Scenario: Restricted indexing
- **WHEN** indexing is disabled in staging or the static review
- **THEN** the sitemap is empty. On the live application the response carries a noindex directive, and the review export emits noindex metadata.

#### Scenario: Private page on production
- **WHEN** a crawler requests an account, admin, learning, checkout or preview-cookie response
- **THEN** the live response has a noindex directive even when the public marketing pages are indexable.

#### Scenario: Hub discovery
- **WHEN** Hub indexing is enabled
- **THEN** its sitemap lists Hub home, contact, about, room pages and non-paused practice sessions. Its robots response advertises the Hub sitemap.

### Requirement: Social previews

Public share metadata SHALL include brand-appropriate image, title and description, with wide and square JPEGs in Open Graph and the wide artwork in the large Twitter card.

#### Scenario: Sharing a current public page
- **WHEN** a supported search or messaging crawler requests the URL
- **THEN** metadata is available in the document head and image URLs use the build's public origin and path prefix. A newly added public slug without artwork uses the branded fallback.

#### Scenario: Sharing a private URL
- **WHEN** a private account, learning, checkout or management URL contains a user identifier or query data
- **THEN** its preview uses the generic family URL and artwork without disclosing those values.

### Requirement: Historic search destinations

Retired Academy URLs with known replacements SHALL lead to their corresponding current resources. Unknown slugs shall retain the site's missing-page response.

#### Scenario: Former food course URL
- **WHEN** an incoming link uses `/food-photography`
- **THEN** the live application redirects permanently to `/food-product-photography`.

#### Scenario: Obsolete catalog entry
- **WHEN** an external link uses one of the retired catalog paths
- **THEN** the Academy-index redirect preserves its query and the search sitemap contains the current destination once.
