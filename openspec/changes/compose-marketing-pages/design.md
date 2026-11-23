## Research and design decisions
Storyblok places a block picker next to the content being assembled and gives each block its own editable fields. Adopt a short, illustrated picker and select the new instance immediately. [Blocks](https://www.storyblok.com/docs/concepts/blocks) · [Visual Editor](https://www.storyblok.com/docs/manuals/visual-editor)

WordPress patterns insert a prearranged group that an author can customize. A template here creates independent starting content for a blank, editorial, course or workshop page. A template carries no payment or enrollment permissions. [Block patterns](https://wordpress.org/documentation/article/block-pattern/)

Storyblok separates asset discovery from placement. Use one searchable image picker from an existing photo or a new block, show thumbnails and support upload there. Keep image descriptions specific to the placement. Only public marketing photography belongs to this library. [Assets](https://www.storyblok.com/docs/manuals/assets)

Webflow exposes properties of the selected component. Sanity supports named text styles. Combine those patterns in a contextual inspector: font family, size, color, weight and alignment have readable Ukrainian labels, a working preview and reset. Style choices affect presentation independently of semantic heading level. [Component properties](https://help.webflow.com/hc/en-us/articles/55024205780627-Components-in-rich-text) · [Sanity text styles](https://www.sanity.io/docs/studio/portable-text-editor-configuration)

## Model and rendering
Extend each page's existing section/field contract with optional editorial block type, ordered item identifiers and text style tokens. Use shared factories and renderers for preview and publication. A custom content region on existing pages preserves native enrollment, navigation and page-specific interactive modules. Old documents without new metadata retain their original rendering. Reordering preserves identifiers. Duplication makes a new independently editable instance.

## Persistence and boundaries
Validate block shape, types, styles, item count, media provenance and destinations server-side. Accept incomplete work as a draft. Require meaningful content and alternatives for informative images at publication. Keep the current authorization, revision protection and explicit publishing. Serve library data through the authenticated image endpoint. Use thumbnails and bounded result sets. Keep marketing uploads and private lessons in separate projects.

## Delivery
Exercise the flow locally and on staging with an existing page or temporary QA page. Verify draft privacy, published output, responsive controls and restoration. Preserve the production deployment.
