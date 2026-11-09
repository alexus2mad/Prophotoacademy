# Figma / Claude artifact source conflicts

Read-only audit, 9 November 2026. Inspected all 14 `figma-*.json.0.txt` design-context files, the page metadata in `figma-website-page.json`, `artifact-audit.md`, original artifact stylesheet/inventory, and saved Figma screenshots for home, mobile home, Academy, contacts and mobile AI artwork. Local evidence is under `.data/final-design/`. This document records source differences; it does not claim implementation, repairs or deployment.

Sources: [Figma website design](https://www.figma.com/design/CvY4dgmOevd9ehxk9Xsaqd?node-id=848-2) and [Claude artifact](https://claude.ai/artifact/FwrroMxpu7ApuHRefQRW3t).

## Approved source decision

The user confirmed **Figma takes visual priority; the artifact fills missing layouts and interactions only**. For the cross-source visual conflicts below, implement the relevant Figma page/frame value, rather than averaging it with the artifact or assuming a reusable Figma component overrides a page-specific instance. The user's separate requirement for **white text on red primary CTAs** remains an explicit exception to dark-text examples in either source.

Keep authoritative content and server rules: current program/package identities, prices and availability, inquiry validation and consent, payment modes, checkout authorization and access grants stay in the existing domains. Design screenshots are not authority to change business data or bypass these boundaries. Missing layouts or interaction states can use the artifact while retaining these rules.

The references appear to contain differing revisions: Academy/Studio/Shop/Contacts use component compositions and measurements that differ from the absolute-positioned home and AI frames, which agree more closely with many artifact formulas. This is an inference from measured differences, not a verified edit history. Do not apply a component-library measurement to all frames without checking its actual page instance.

## Cross-source visual conflicts — decision: follow the relevant Figma frame

1. **Condensed heading font differs everywhere it is used.** Figma specifies `Roboto Condensed`, style `Bold`; artifact `--poster` specifies the embedded `HeliosCond` 700, with Roboto Condensed only a fallback after Arial Narrow. These are different fonts, not alternate spellings. Matching nominal font size will not establish a 2 px layout match. Figma contains no HeliosCond declaration; neither source declares Inter for these designs.
2. **KyivType weight mapping differs.** Figma exports `KyivType Sans` Light- as 200 (`font-extralight`), Regular- as 350, Medium- as 500, Bold- as 700 and Black- as 1000. Artifact face declarations and CSS use 300/400/500/700/900. Figma additionally records variation axes `CONT=0, MIDL=0`. These may reflect the font's native naming/weight metadata, so verify the actual font binaries instead of mechanically changing a CSS number and claiming equivalence. The differences affect headline widths and text wrapping throughout.
3. **Desktop hero type and spacing differ beyond tolerance.** At width 1440, artifact `.ah h1,.ph h1` is 138.24 px while Figma Academy/Studio/Shop/Contacts H1 is 136 px (**2.24 px** difference). Artifact handwriting is 77.76 px versus Figma 81 px (**3.24 px**). Academy `Hero` 853:191 starts with 128 px padding and ends with 48 px; artifact `.ah` computes 136/64 px (**8/16 px**). Contacts 854:631 also uses 128 px top padding. Home and AI have different measurements: e.g. AI H1 138.2 px agrees with 138.24 within rounding.
4. **Form section colors conflict.** Figma Academy `Заявка` 853:379 and Studio `Бронювання` 854:460 use red `#eb423b`, with white handwriting on the Academy form. Artifact `.red` explicitly uses paper `#fbfbfb` and warm text, with red handwriting. Figma home and AI final forms already use paper. This is an internal Figma inconsistency as well as an artifact conflict.
5. **Desktop final-form columns are different.** Figma Academy 853:380 uses equal flex columns and 96 px gap: at a 1360 px content width, right form starts at x=768 and is 632 px wide. Artifact `.fin` uses 1.15fr/.85fr and a 6vw gap = 86.4 px: right form starts at x=858.72 and is 541.28 px wide (**90.72 px horizontal/width difference**). Figma home/AI form x=858.7 agrees with the artifact formula, showing that the references differ. Studio booking uses an 80 px gap while artifact `.book` computes 72 px at 1440 (**8 px**). Shop uses equal columns/96 px gap while artifact `.pick` uses 1.1fr/.9fr and 72 px gap.
6. **Contacts typography and copy controls differ.** Figma details 854:641/647/653 are Roboto Condensed 32 px; artifact `.ct b` is HeliosCond 42 px at 1440 (**10 px size difference**). Figma copy button 854:642 is a 44 px high chip with regular 15 px text; artifact `.copy` is bold 11 px uppercase, 11 px vertical padding and 1.5 px border, giving 36 px height (**4 px text and 8 px height difference**). Decision: retain the Figma chip in the Figma contacts layout; it is not an exact match for the artifact copy button.
7. **Inquiry drawer differs.** Figma 854:755 has top padding 24 px, title 854:759 at 52 px and general 12 px stack gaps. Artifact `.drawer` has 16 px top padding and `.drawer h2` at 44 px (**8 px each**), with separate heading/body margins. Figma's shared form uses a single-line input-shaped comment field (~50.3 px from 24.8 px line height + 24 px padding + 1.5 px border); artifact textarea minimum is 76 px (**~25.7 px**). Current Figma home/AI forms use larger comment areas, again unlike this reusable component.
8. **Shared footer columns differ.** Shared Figma `Footer` 851:34 uses four equal flex columns with 28 px gaps, so second column starts at x=387 for a 1440 frame. Artifact `.foot-g` uses 1.3fr/1fr/1fr/1.2fr, so second column starts at x=436.62 (**49.62 px difference**). Figma home itself uses x=436.6, agreeing with artifact rather than the reusable Footer. Follow each page frame rather than forcing this component onto every page.
9. **Academy section-heading rhythm differs.** Figma section heads such as 853:211 use 14 px inner gap and 56 px bottom padding. Artifact `.sect-head` is 18 px gap and 64 px bottom margin at 1440 (**4/8 px**). The Figma speaker names are 32 px (853:341/347), while artifact `.pp h3` reaches 36 px (**4 px**). Most general section padding is Figma 130 vs artifact 129.6: that 0.4 px difference is harmless rounding and should not be treated as a conflict.

The explicit user rule **white text on red primary CTAs** overrides both sources' red/dark-text examples. Preserve that instruction after any desktop, mobile, touch and hover rules. It is a known authorized exception, not a source ambiguity.

## Figma layer anomalies / export traps — separate from source precedence

These are suspected errors within Figma/export evidence, not permission to substitute the artifact's whole layout. The table records the proposed interpretation; no layer repair or application change has been made by this audit.

| Evidence | Problem | Actionable interpretation |
| --- | --- | --- |
| Home desktop 886:1102 `Консультація` and 886:1103 `Коментар (необов’язково)` | Both x=416.191986; surrounding form labels, inputs and underline nodes 886:1101/1104 are x=858.700012. Displacement **442.508026 px** left. Screenshot shows these text fragments detached into the left heading column. | Treat as an obvious damaged/misplaced layer, not an intentional split form. Keep controls/labels associated and aligned within the same form column; record this proposed exception to Figma geometry. |
| Home mobile 884:855 background rectangle | y=-278, h=6162.600098 inside a 6163 px frame; equivalent background rectangles on other home variants start at y=0. It ends at y=5884.6, leaving ~278.4 px of nominal frame uncovered, masked by the identical root fill. | Do not copy the negative offset into a web layout. This is a background-layer anomaly with no intentional content positioning benefit. |
| Home mobile heading 884:1010 asterisk vs 884:1011 `студентів` | Same 51 px Marck Script / 40.8 px line height, but asterisk y=3372 and word y=3364 (**8 px baseline displacement**). Shop-tab equivalents 898:580/581 both y=3294. | Likely accidental asterisk drift. Implement the handwriting phrase as one typographic run or align to the intended baseline, rather than copying the isolated offset. |
| Generated Studio 854:427 and Shop 854:547 script labels | JSX says `leading-[0]`, but metadata reports each text layer h=81 and the next H1 starts y=81; the screenshot preserves a real line box. | This is a code-generation trap, not evidence the design intends a zero-height text line. Prefer actual layer geometry and screenshot. Similar rich-text parent wrappers use `text-[0px]`/`leading-[0]` while spans provide real sizes. |
| Absolute frame exports | Carousel off-screen images/text may extend beyond visible frame bounds, and centered text can use `-translate-x-1/2`. | Do not classify overflow or midpoint `left` values alone as malformed. The three anomalies above were checked against metadata or neighboring same-purpose layers. |

## Content and scope conflicts that change layout substantially

- Academy Figma includes **3** primary course rows and **4** workshop rows. Artifact inventory includes **4** primary rows (adds commercial content creator) and **5** workshop rows (adds AI artwork). This changes section height far beyond 2 px and affects the flagship course journey. Do not remove valid live content to mimic the frame without an explicit content decision.
- Academy Figma carousel 853:354 contains **4** authored review cards (only approximately three fit in the visible strip); artifact has **11** review cards. Count source nodes, not only the screenshot's visible cards.
- Figma Contacts/Studio/Footer content says **Київ, вул. Введенська, 32**; artifact inventory and Figma home/mobile footers say **Саксаганського, 24/25**. Use verified current content rather than silently spreading the conflicting address. This audit does not establish the real-world correct address.
- Figma desktop home has six Academy direction cards immediately after exposure. Artifact captured inventory has no such home Academy heading/cards and does include three studio hall cards and a course picker; CSS still defines a `.s-acad` section. This is a captured-state/source-content discrepancy, not proof that the artifact can never display directions. Preserve the audit's state limitation.
- No dedicated course-detail frame, Academy mobile frame, Contacts mobile frame, Studio mobile page frame, or Shop mobile page frame is among the 14 references. The Studio/Shop mobile frames are **home tab states**, not their destination pages. Course artifact captures supplement the earlier empty `p-course` inventory; do not claim Figma measures those pages.
- Long-page frame height is document content height, not viewport height. Home desktop's 872 px hero suggests a 1440×900 capture (`100svh-28px`), and mobile home explicitly has an 844 px hero. Do not derive responsive `vh` from total frame height (8075/6163/etc.). Desktop Studio/Shop fixed 720 px hero differs from artifact `clamp(480px,78vh,800px)` at a 900 px viewport (702 px, **18 px**), but this comparison is viewport-dependent and should remain conditional.

## Exact font inventory and 14-frame inventory

Font tokens below preserve exact Figma exported family/style names. Underscores in generated Tailwind family names encode spaces, so `KyivType_Sans:Regular-` means family **KyivType Sans**, style **Regular-**.

- **K-R** = `KyivType_Sans:Regular-` (350 exported).
- **K-L** = `KyivType_Sans:Light-` (200 exported).
- **K-M** = `KyivType_Sans:Medium-` (500 exported).
- **K-B** = `KyivType_Sans:Bold-` (700 exported).
- **K-X** = `KyivType_Sans:Black-` (1000 exported).
- **R-B** = `Roboto_Condensed:Bold` (700).
- **M-R** = `Marck_Script:Regular` (normal/400).

Dimensions below are the actual metadata frame dimensions, not screenshot pixel sizes. Font lists include shared component definitions/instances used by the page export; logos remain vector assets rather than text fonts.

| Frame / node | Saved reference prefix | Exact W × H | Exact font/style tokens present |
| --- | --- | --- | --- |
| Компоненти — 849:2 | `figma-components` | 1536 × 2440.114013671875 | K-R, K-B, K-X, R-B |
| Академія — 1440 — 853:190 | `figma-academy` | 1440 × 7515.11376953125 | K-R, K-B, K-X, R-B, M-R |
| Студія — 1440 — 854:417 | `figma-studio` | 1440 × 3905.614013671875 | K-R, K-B, K-X, R-B, M-R |
| Shop — 1440 — 854:539 | `figma-shop` | 1440 × 1827.114013671875 | K-R, K-B, K-X, R-B, M-R |
| Контакти — 1440 — 854:630 | `figma-contacts` | 1440 × 1435.114013671875 | K-R, K-B, K-X, R-B, M-R |
| Форма заявки — 480 — 854:755 | `figma-inquiry` | 480 × 900 | K-R, K-B, R-B |
| Меню — 390 — 882:836 | `figma-menu-mobile` | 390 × 907 | K-R |
| Меню — 1440 — 883:845 | `figma-menu` | 1440 × 900 | K-R, K-L |
| Головна — 390 — 884:854 | `figma-home-mobile` | 390 × 6163 | K-R, K-L, K-M, K-B, K-X, R-B, M-R |
| Головна — 1440 — 886:873 | `figma-home` | 1440 × 8075 | K-R, K-L, K-M, K-B, K-X, R-B, M-R |
| Інтенсив AI artwork — 1440 — 892:397 | `figma-ai-artwork` | 1440 × 6263 | K-R, K-L, K-M, K-B, K-X, R-B, M-R |
| Інтенсив AI artwork — 390 — 893:401 | `figma-ai-artwork-mobile` | 390 × 5931 | K-R, K-L, K-M, K-B, K-X, R-B, M-R |
| Головна — 390 · вкладка Studio — 897:405 | `figma-home-studio-mobile` | 390 × 5786 | K-R, K-L, K-M, K-B, K-X, R-B, M-R |
| Головна — 390 · вкладка Shop — 898:424 | `figma-home-shop-mobile` | 390 × 6007 | K-R, K-L, K-M, K-B, K-X, R-B, M-R |

The full page metadata also contains four non-reference frames: `Зображення` 849:89 and logo groups 872:784, 872:829, 872:874. These are deliberately excluded from the 14 UI-reference inventory.

## Tolerance and implementation implications

This is a source-conflict audit, not pixel-diff certification of an implementation. Decimal rounding such as 106.6 vs 106.56, 129.6 vs 130, or mobile H1 40.587/40.7 vs formula 40.6818 is within 2 px. Font substitution, content omissions, form color/columns, footer ratios and the explicit anomalies above are not.

## Implementation findings — AI faculty typography and live offers

The AI mobile frame names `Roboto_Condensed:Bold` at 30 px for the lecturer's client chips, but several text widths closely match the artifact's **HeliosCond**, not Roboto Condensed. FontTools measurements of the official current Roboto Condensed (v3.008, instantiated at weight 700) and official historic Roboto Condensed Bold (v2.001047) differ by less than 0.06 px at this size. Changing to the historic font would not resolve the discrepancy.

| Uppercase client text | Figma text width (chip width minus 46 px padding/border) | Roboto Condensed v3 unkerned advance | Artifact HeliosCond unkerned advance |
| --- | ---: | ---: | ---: |
| МАША КОНДРАТЕНКО | 261.8 px | 282.95 px | 265.11 px |
| БРИКУЛЕЦЬ | 145.3 px | 154.70 px | 146.46 px |
| GO_A | 65.0 px | 65.58 px | 64.97 px |
| MOLODI | 93.0 px | 98.36 px | 92.96 px |
| РОКСОЛАНА | 147.9 px | 159.95 px | 148.39 px |
| МАЙОРОВА | 136.5 px | 146.84 px | 136.52 px |
| ШМАЛЬГАУЗЕН | 185.9 px | 199.01 px | 188.38 px |
| АЗІЗА | 71.0 px | 76.41 px | 70.97 px |

These are unkerned font advances, so small residual differences from Figma are expected. Browser-kerning reduced the first Roboto example to 278.55 px, still substantially wider than the source. The official historic comparison came from `googlefonts/roboto-2/src/hinted/RobotoCondensed-Bold.ttf`; the current font is the pinned Google Fonts binary documented in the asset provenance. Temporary font inputs remain in the ignored private audit directory.

**Disposition:** honor Figma's named Roboto Condensed family; do not substitute HeliosCond, horizontally stretch text, scale individual names, or clip the faculty section. At a 390 px content width, MOLODI and РОКСОЛАНА therefore occupy separate rows. Faculty is about 1391 px tall versus the source's 1318 px. The remaining difference is explicitly not a 2 px conformity claim. The source's 36 px heading gap and 124/146.5 px experience-row rhythm are preserved with inset rules that do not add layout height.

The supplied KyivType subset has an empty star glyph. Academy review stars use Arial for the five rating symbols only; the names and body text retain the specified families.

The AI artwork frame's dated `22.11` / `11:00–16:00` offer does not correspond to a currently mapped CMS offering. The page therefore says **Дату уточнюємо**, uses **Залишити заявку** CTAs, and explains **Умови участі підтвердимо після заявки**. Source reference prices (3,900 UAH offline / 3,000 UAH online) remain in the inquiry presentation. If an `ai-artwork` program and offering are supplied, its schedule and package prices replace these references. No checkout or confirmed-availability promise is invented.

## Additional implementation dispositions

- Homepage exposure: Figma has a 900 px in-flow section at the desktop reference viewport. The artifact's 150vh sticky runway would shift every following section by 450 px. Keep Figma geometry and its scroll-driven meter; reduced motion keeps a stable state.
- Real inquiry forms retain the existing required privacy-consent checkbox, validation, retry and review-mode states absent from the visual mockups. The consent row adds approximately 32–40 px to a form; it is a functional adaptation, not a claimed spacing normalization within 2 px.
- Desktop header follows Figma's Academy / Studio / Shop / Contacts links. The existing account destination remains in the menu and the source mobile account icon. A fourth secondary menu link preserves access to the student area.
- Social links use verified application settings. Facebook is omitted because the current content has no verified destination, rather than publishing an invented URL.
- Existing course detail pages use the artifact's image-first mobile composition. This supersedes the earlier pre-design request to put pricing on the first mobile screen. Their package prices, eligibility and checkout links still come from the application, not the artifact's sample packages.
- Contact information, course titles, schedules, package prices and Academy-authored student stories remain accurately attributed to their existing content records. Differences from reference copy are not represented as pixel-matched text.

Figma remains authoritative. Layouts use semantic responsive structure rather than absolute exported page positions. Verification at 1440 and 390 content pixels is recorded separately; source font inconsistencies and functional adaptations above prevent an unconditional all-elements-within-2-px certification.
