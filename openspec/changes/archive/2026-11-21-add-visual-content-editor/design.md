# Page editor design

## Editor experience

Use a page library with Ukrainian names, type and publication state. Open a page into its named sections, with labeled text fields and image thumbnails. Show a preview at desktop or phone width. On small screens separate the editing surface and preview so both remain usable. Saving a draft, inspecting it and publishing are distinct actions. Errors and conflicts retain the editor's local work.

The interaction follows the pages panel and focused field editing used in [Webflow](https://help.webflow.com/hc/en-us/articles/33961251014931-Edit-site-content-as-a-content-editor) and the draft/preview/publish distinction in [Wix](https://support.wix.com/en/article/wix-editor-saving-previewing-and-publishing-your-site). The site already has design-approved components, so use those for preview and public rendering.

## Content and rendering

- Use stable page paths and section/field IDs, readable Ukrainian labels and typed text, multiline and image values. Resolve existing editorial values server-side or through the initial server-rendered React tree. Preserve responsive sources and existing animation controls.
- Build the initial page documents from current source content. Share that representation between the editor, published render and preview. Existing editable slots keep their approved structure. New pages use a controlled landing template with named, editable sections.
- Prices, purchase URLs, availability, package entitlements, session/access state and system form messages remain with their owning services. A marketing editor cannot change commercial authorization.

## Storage and boundaries

- Use independent published-site-content configuration. A public marketing dataset may supply page documents even when verified offers use the repository fixture. Preserve the current output until the first saved/published changes. Provide repeatable, non-destructive seed initialization and isolated local development storage.
- Authenticate Academy administrators on all management and draft reads and writes. Scope draft preview to the requested page. Keep drafts out of public caches, public listings, SEO and the static export. Store only public editorial images in the marketing asset library. Use optimistic revisions to reject stale saves or publications.
- Use scope-appropriate limits, validate external inputs, reserve existing/system routes and check new paths for collisions. Keep editing functionality out of the synthetic GitHub Pages runtime.

## Verification

Compare initial public text, images and destinations for existing landing families against the baseline. Exercise a draft text and image change, reload, preview, publish, new page, duplicate path, stale edit and unauthorized access. Check desktop/mobile editor usability, architecture, types, integration tests, production build and static export. Deployment and live content publication are separate operations.
