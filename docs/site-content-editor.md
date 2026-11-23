# Admin site content editor

Administrators open **Сторінки сайту** in the Academy workspace at `/admin/content`. Find a page by Ukrainian title or public path. Click or tap editable text on the page and type where the text appears. Keyboard users can focus a field and press Enter. Escape restores the value from when the active edit began.

## Авторська робота зі сторінкою

- Щоб створити сторінку, відкрийте **Створити сторінку**, вкажіть назву й адресу та оберіть шаблон. **Чиста сторінка** починається з обкладинки. **Стаття** додає абзац і фотографію, **Курс** — вступ, заголовок і картки, **Воркшоп** — вступ і карусель. Кожна сторінка отримує власну копію блоків.
- Щоб вставити заголовок, абзац, фотографію, картки або карусель, натисніть **+** у попередньому перегляді саме там, де має з’явитися блок. Оберіть тип і заповніть його. Можна вставляти між готовими розділами та між уже доданими блоками.
- Щоб перемістити доданий блок, потягніть його за **Перемістити** до потрібної лінії. На телефоні або з клавіатури можна натиснути цю ж кнопку й обрати нове місце зі списку. Натисніть Escape, щоб скасувати. Порядок відображається у чернетці відразу, а на сайті — після публікації.
- Натисніть текст у попередньому перегляді або виберіть його в полях. Для оформлюваного тексту можна вибрати шрифт, розмір, колір, насиченість і вирівнювання та повернути початковий вигляд. Перемикайте телефонний і настільний перегляд, щоб перевірити переноси й читабельність.
- Натисніть фотографію або її поле, щоб відкрити **Бібліотеку зображень**. Знайдіть фото за назвою, виберіть із фотографій академії чи попередніх завантажень або скористайтеся **Завантажити файл**. Після вибору натисніть **Вставити зображення**. Впишіть опис, який пояснює цю фотографію саме в цьому місці.
- Натисніть **Зберегти чернетку**, перевірте результат і виберіть **Опублікувати**, коли сторінка готова для відвідувачів. Якщо інший адміністратор змінив сторінку, редактор повідомить про конфлікт і збереже ваші зміни на екрані.

Published course and workshop pages appear in the corresponding Academy lists. Prices, payment eligibility and enrollment are managed through their configured offers.

## Storage and activation

| Setting | Purpose |
| --- | --- |
| `NEXT_PUBLIC_ACADEMY_DESIGN=studio` | Active Academy design used by the visual editor and its preview. Set before building the public app |
| `SITE_EDITOR_MODE=readonly` | Default. Render the initial page inventory and allow administrators to inspect it |
| `SITE_EDITOR_MODE=local` | Development or the local learning sandbox. Drafts, published pages and WebP images persist together under `.data/site-editor` or `SITE_EDITOR_LOCAL_DIR` |
| `SITE_EDITOR_MODE=sanity` | Use Sanity for page drafts, publications and image uploads |
| `SITE_EDITOR_PROJECT_ID` | Server-only marketing project. Use `qy8emt0h` on production and `3k86g5dt` on staging |
| `SITE_EDITOR_WRITE_TOKEN` | Dedicated server-side credential for marketing drafts, published documents and image uploads |
| `SANITY_API_WRITE_TOKEN` | Optional legacy writer for other installations. Both Academy deployments require a dedicated marketing writer |
| `SANITY_API_READ_TOKEN` | Optional server credential for published reads when the dataset requires authentication |

The private learning dataset and student records are managed separately. Keep the marketing writer scoped to its intended dataset. The GitHub Pages export uses the initial documents with its read-only adapter. Public editorial image uploads become public marketing assets by URL, including while the containing page is a draft. Use private course authoring for paid lesson media.

Staging edits public dataset `production` in marketing-only project `3k86g5dt`. Set `SITE_EDITOR_PROJECT_ID=3k86g5dt`, `SITE_EDITOR_MODE=sanity` and a dedicated `SITE_EDITOR_WRITE_TOKEN` from this project in the staging runtime. Published page reads are anonymous. Keep `NEXT_PUBLIC_SANITY_PROJECT_ID=p0dn7nmp`, `NEXT_PUBLIC_SANITY_DATASET=production`, the learning credential and `SANITY_LEARNING_DATASET=learning-staging` in place. Leave `SANITY_API_WRITE_TOKEN` unset. The independent project limits the marketing writer's provider-level permissions to marketing data.

1. Set the marketing dataset and server credentials on staging. Verify it is the intended dataset. Configure the editor independently of `CONTENT_MODE`, which selects the existing catalog and offering data.
2. From a trusted source checkout, run `pnpm site:seed` to inspect the inventory. Run `pnpm site:seed --write` with the intended marketing dataset credentials to initialize published documents. Repeating the command preserves existing documents and drafts. Runtime release directories contain compiled files.
3. Apply the request size settings in the supplied nginx environment template so authenticated administrators can upload images up to 10 MiB. Uploads are decoded and normalized to WebP. Restart the app after setting its environment.
4. Sign in with an existing Academy administrator. Make a draft edit, check its phone and desktop preview and verify the published page in a signed-out browser. Publish only approved changes. A new course or workshop still needs a separately configured offer for sales.
5. Production uses public dataset `production` in marketing-only project `qy8emt0h`. Use a dedicated `SITE_EDITOR_WRITE_TOKEN` from this project and `SITE_EDITOR_MODE=sanity`. The existing production learning project `sfzp6094` and dataset `learning` retain their own configuration. Published reads need no token. Seed with the reviewed release and production catalog, check an unpublished edit and publish the approved copy. Returning the editor to readonly switches rendering back to the initial inventory. Existing Sanity documents remain available when Sanity mode is re-enabled.

For a local rehearsal, `pnpm sandbox:learning` uses its existing synthetic administrator and isolated marketing storage. Open `http://127.0.0.1:3200/admin/content`. Local sandbox credentials are listed by the command. Data survives a sandbox restart.

With the sandbox running and Chrome installed, run `node scripts/sandbox/verify-preview-placement.mjs` to check inserting two blocks, canceling a drag, and reordering them in the scaled preview. An optional argument selects a different local sandbox port. The check closes its browser session without saving the working copy.

## Maintenance

Page documents use stable section and field IDs. Keep IDs stable when changing labels or rendering. The same initial values populate the editor and the default presentation. A saved document overlays these slots within the existing design. Public reads use published records. The preview checks the signed-in administrator and applies its draft only to the requested path.

Public marketing templates, new page discovery, sitemap handling, authenticated API routes, and the review export are covered by the site-page-editing specification. Keep page authorship separate from learning, access and payment administration.
