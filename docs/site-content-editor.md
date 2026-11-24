# Admin site content editor

Administrators open **Сторінки сайту** in the Academy workspace at `/admin/content`. Find a page by Ukrainian title or public path. Click or tap editable text on the page and type where the text appears. Keyboard users can focus a field and press Enter. Escape restores the value from when the active edit began.

## Як доручити редагування агенту

Навичка **prophoto-editor** дає змогу працювати з цим редактором через Codex або Claude Code. Агенту потрібен браузер, яким він може керувати. Увійдіть у ньому до облікового запису адміністратора Академії.

- **Якщо ви відкрили репозиторій у Codex або Claude Code**, навичка вже є в проєкті. У новій сесії викличте її як `$prophoto-editor` у Codex або `/prophoto-editor` у Claude Code.
- **Щоб користуватися навичкою в будь-якому проєкті**, скопіюйте команду зі сторінки встановлення й виконайте її в терміналі. Потрібен Node.js версії 22 або новішої з npm. Команда встановлює навичку для поточного користувача в Codex і Claude Code. Якщо потрібен лише один агент, додайте `--target codex` або `--target claude`. Після встановлення відкрийте новий чат. [Скопіювати команду встановлення](https://staging.prophotoacademy.com.ua/skills/prophoto-editor/)
- **Для ручного встановлення** завантажте ZIP і розпакуйте папку `prophoto-editor` у `~/.agents/skills/` для Codex або `~/.claude/skills/` для Claude Code. На Windows `~` означає папку вашого користувача. Перевірте, що всередині `skills/prophoto-editor/` є файл `SKILL.md`, і відкрийте новий чат. [Завантажити ZIP](https://staging.prophotoacademy.com.ua/skills/prophoto-editor/prophoto-editor.zip) · [Оригінал навички](../.agents/skills/prophoto-editor/SKILL.md) · [Навички в Codex](https://developers.openai.com/codex/skills/) · [Навички в Claude Code](https://code.claude.com/docs/en/skills)

Приклад для дизайнера

> $prophoto-editor На staging на сторінці /flash-without-fear додай перед галереєю абзац «Візьміть із собою камеру». Перевір, як він виглядає на телефоні й комп’ютері, і дай мені посилання на чернетку.

Приклад для контент-менеджера

> /prophoto-editor Створи на staging чернетку воркшопу за прикріпленим брифом. Візьми обкладинку з моїх файлів, а фотографії для каруселі — з бібліотеки. Покажи чернетку на перевірку.

Посилання на чернетку відкривається адміністраторам. Для публікації вкажіть середовище й сторінку, наприклад «Опублікуй погоджену чернетку /flash-without-fear на staging». Публікація застосовує всю збережену чернетку.

## Авторська робота зі сторінкою

- Щоб створити сторінку, відкрийте **Створити сторінку**, вкажіть назву й адресу та оберіть шаблон. **Чиста сторінка** починається з обкладинки. **Стаття** додає абзац і фотографію, **Курс** — вступ, заголовок і картки, **Воркшоп** — вступ і карусель. Кожна сторінка отримує власну копію блоків.
- Щоб вставити заголовок, абзац, фотографію, картки або карусель, натисніть **+** у попередньому перегляді саме там, де має з’явитися блок. Оберіть тип і заповніть його. Можна вставляти між готовими розділами та між уже доданими блоками.
- Щоб перемістити доданий блок, потягніть його за **Перемістити** до потрібної лінії. На телефоні або з клавіатури можна натиснути цю ж кнопку й обрати нове місце зі списку. Натисніть Escape, щоб скасувати. Порядок відображається у чернетці відразу, а на сайті — після публікації.
- Натисніть текст у попередньому перегляді або виберіть його в полях. Для оформлюваного тексту можна вибрати шрифт, розмір, колір, насиченість і вирівнювання та повернути початковий вигляд. Перемикайте телефонний і настільний перегляд, щоб перевірити переноси й читабельність.
- Натисніть фотографію або її поле, щоб відкрити **Бібліотеку зображень**. Знайдіть фото за назвою, виберіть із фотографій академії чи попередніх завантажень або скористайтеся **Завантажити файл**. Після вибору натисніть **Вставити зображення**. Впишіть опис, який пояснює цю фотографію саме в цьому місці.
- Натисніть **Зберегти чернетку**, перевірте результат і виберіть **Опублікувати**, коли сторінка готова для відвідувачів. Якщо інший адміністратор змінив сторінку, редактор повідомить про конфлікт і збереже ваші зміни на екрані.

Published course and workshop pages appear in the corresponding Academy lists. Prices, payment eligibility and enrollment are managed through their configured offers.

Для окремої картки сторінки у Facebook, Telegram, WhatsApp і Viber передайте її публічну адресу, назву, короткий опис і схвалене фото для публічного поширення. Широке й квадратне зображення готуються разом за [правилами соціальних прев’ю](SOCIAL_PREVIEWS.md).

## Як створити практичний інтенсив

1. У **Створити сторінку** оберіть **Практичний інтенсив**. Додайте назву, адресу, обкладинку й опис фотографії. Короткі факти про тривалість, групу або моделей вводьте по одному на рядок.
2. У **Програма інтенсиву** додайте по одній темі для кожної секції, що розгортається. Кожен рядок завдань стане окремим пунктом. Обгорніть потрібні слова у `**подвійні зірочки**`, щоб виділити їх жирним.
3. У **Галерея інтенсиву** виберіть фотографії з бібліотеки та опишіть кожну. Для зміни кадрування задайте центр, наприклад `62% 40%`. Стрілки в редакторі змінюють послідовність фотографій.
4. У **Перший екран → Квиток для оплати** оберіть квиток, підготовлений для цієї адреси. Ціна в заголовному блоці вартості й у картці квитка береться із системи оплати. На staging кнопка «Записатися» відкриває тестову оплату. У попередньому перегляді кнопку вимкнено.
5. Перевірте обидві ширини, збережіть чернетку й опублікуйте. Воркшоп з’явиться в розділі **Воркшопи** на сторінці Академії. Щоб закрити продаж, оберіть **Без продажу квитків**, збережіть і опублікуйте сторінку.

## Як перенести сторінку зі staging на прод

Переноситься лише **опублікована** версія сторінки на staging. Спершу опублікуйте її там і перевірте.

1. **Зі staging.** Відкрийте сторінку в редакторі staging і натисніть **Опублікувати на проді**. Кнопка активна, коли немає незбережених змін і неопублікованої чернетки. У новій вкладці відкриється редактор продакшну. Увійдіть обліковим записом адміністратора продакшну, якщо потрібно.
2. **На проді.** У **Сторінки сайту** натисніть **Зміни зі staging**. Список показує нові сторінки й сторінки, що відрізняються від staging: змінені блоки, кількість фото для копіювання і попередження. Однакові сторінки лише враховуються в лічильнику.
3. Перевірте попередження. **Чернетка на проді** буде замінена. **Квиток** на проді продаватиметься через живу оплату WayForPay. Сторінка, що відрізняється лише на проді (наприклад, юридичні тексти), перезапишеться версією зі staging. Відкрийте **Переглянути на staging**, якщо треба порівняти.
4. Натисніть **Опублікувати на проді** і підтвердьте. Фото копіюються в бібліотеку продакшну, адреси staging замінюються на адреси продакшну, і сторінка одразу стає публічною. Якщо сторінку на staging або на проді змінили після завантаження списку, публікацію буде зупинено. Оновіть список і повторіть.

Налаштування оплати не переносяться. Staging працює з тестовою оплатою, а прод — із живим WayForPay. Сторінка воркшопу переносить лише вибір квитка, а ціну й оплату визначає сервер кожного середовища. Сторінки, яких немає на staging, на проді не видаляються.

Production reads staging's published pages and photo assets anonymously from project `3k86g5dt`; staging never receives production credentials. The sync is unavailable on staging, in readonly or local mode, and on other installations. `GET/POST /api/admin/site-content/sync` require an administrator session, and `POST` also requires a same-origin request.

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

The staging installation page publishes the current one-command installer and a ZIP from the same release. Edit the portable skill and its launcher metadata in `.agents/skills/prophoto-editor/`. For a new release, update the version in `scripts/editor-skill/package.json` and run `pnpm skill:pack` from the repository root with Python 3 available. Distribute the [staging installation page](https://staging.prophotoacademy.com.ua/skills/prophoto-editor/) to the team.

Page documents use stable section and field IDs. Keep IDs stable when changing labels or rendering. The same initial values populate the editor and the default presentation. A saved document overlays these slots within the existing design. Public reads use published records. The preview checks the signed-in administrator and applies its draft only to the requested path.

Public marketing templates, new page discovery, sitemap handling, authenticated API routes, and the review export are covered by the site-page-editing specification. Keep page authorship separate from learning, access and payment administration.
