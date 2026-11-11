# Staging social-image gallery

The public review gallery is available at
`https://staging.prophotoacademy.com.ua/social-previews/`. It shows the same
33 page designs and 66 wide/square JPEGs as the local review, with original-file
downloads. It is a static review artifact, independent of the staging Next.js
release. It does not publish the gallery on production or add site navigation.

Only existing public artwork is included. Account, lesson and administration
cards are generic brand illustrations, not screenshots or customer records.
`noindex` discourages search indexing; it is **not access control**. Anyone with
the URL can view and download the artwork.

## Recreate and verify

Run from the `web` repository root on the intended committed artwork revision:

```sh
pnpm social:check
pnpm social:review
```

The first command checks the source fingerprint and every committed JPEG's hash,
dimensions and size budget. The second generates `.data/social-images/index.html`
with embedded image bytes and inline CSS; no application credentials are needed.
Do not publish the entire `.data` directory, contact sheets or browser captures.

Save the following as an ignored local file, for example
`.data/prepare-public-social-gallery.mjs`, then run it with `node`. It creates
only the publishable HTML and prints its exact transfer-verification hash:

```js
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { load } from 'cheerio';

const registry = JSON.parse(await readFile('src/lib/social-images/images.json', 'utf8'));
const entries = Object.entries(registry);
const source = await readFile('.data/social-images/index.html', 'utf8');
assert(!source.includes('name="robots"'));
const html = source.replace(
  '<meta charset="utf-8">',
  '<meta charset="utf-8"><meta name="robots" content="noindex,nofollow,noarchive">',
);
const $ = load(html);
assert.equal($('meta[name="robots"]').attr('content'), 'noindex,nofollow,noarchive');
assert.equal($('script,iframe,form,link,base,object,embed').length, 0);
assert.equal($('section').length, entries.length);
assert.equal(
  $('img').length,
  entries.reduce((total, [, entry]) => total + entry.images.length, 0),
);
assert(!/url\(|@import/i.test($('style').text()));
for (const section of $('section').toArray()) {
  const route = $(section).find('h2').text();
  assert(Object.hasOwn(registry, route));
  const anchors = $(section).find('a').toArray();
  assert.equal(anchors.length, registry[route].images.length);
  for (const [index, anchor] of anchors.entries()) {
    const expected = registry[route].images[index];
    const img = $(anchor).find('img');
    const uri = img.attr('src');
    assert(uri.startsWith('data:image/jpeg;base64,'));
    assert.equal($(anchor).attr('href'), uri);
    assert.equal($(anchor).attr('download'), path.basename(expected.src));
    const bytes = Buffer.from(uri.slice('data:image/jpeg;base64,'.length), 'base64');
    assert.equal(createHash('sha256').update(bytes).digest('hex'), expected.sha256);
    assert.equal(bytes.length, expected.bytes);
    assert.equal(Number(img.attr('width')), expected.width);
    assert.equal(Number(img.attr('height')), expected.height);
  }
}
const markup = html.replace(/data:image\/jpeg;base64,[A-Za-z0-9+/=]+/g, '');
assert(
  !/file:\/\/|[A-Z]:[\\/]|localhost|127\.0\.0\.1|\.data[\\/]|https?:\/\/|@gmail\.com|supabase|resend/i.test(
    markup,
  ),
);
await mkdir('.data/social-gallery-public', { recursive: true });
await writeFile('.data/social-gallery-public/index.html', html);
console.log({
  bytes: Buffer.byteLength(html),
  sha256: createHash('sha256').update(html).digest('hex'),
});
```

Inspect the result on desktop and mobile. Download at least one original of each
format and confirm it retains its dimensions. Keep the HTML, temporary script,
hash report and transfer files out of Git. Regeneration should be deliberate;
deployments must not silently regenerate the artwork.

## Staging-only serving

Publish **only** `index.html` at `/var/www/prophoto-social-previews/index.html`
with a root-owned `0755` directory and `0644` file. Configure exact Nginx
locations for `/social-previews/` and `/social-previews/index.html` in the HTTPS
server whose `server_name` is `staging.prophotoacademy.com.ua`, in
`/etc/nginx/sites-available/prophotoacademy.conf`. The slash location must
internally rewrite to the exact index location; only the index location aliases
the file. This avoids Nginx treating the trailing-slash request as a directory:

```nginx
location = /social-previews/ {
    rewrite ^ /social-previews/index.html last;
}
location = /social-previews/index.html {
    alias /var/www/prophoto-social-previews/index.html;
    default_type text/html;
    charset utf-8;
    # Include all gallery headers below in this location.
    limit_except GET HEAD { deny all; }
}
```

This is an internal rewrite, not a browser redirect. Reject every other path below
`/social-previews/`; the slashless path is not a gallery entry point. Permit only
GET/HEAD. Do not enable directory listing, proxy these requests to Next.js or
expose preparation scripts and verification reports.

The HTML has no external requests, scripts, fonts, APIs or cookies. Its response
must use `Content-Type: text/html; charset=utf-8` and these scoped
headers:

```nginx
add_header X-Robots-Tag "noindex, nofollow, noarchive" always;
add_header Cache-Control "public, max-age=300, must-revalidate" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "no-referrer" always;
add_header Content-Security-Policy "default-src 'none'; img-src data:; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'" always;
```

Repeat `X-Robots-Tag` in gallery locations: location-level `add_header` directives
can prevent inheritance of the existing staging header. Keep the production
server block, payment callback routing, app services, runtime configuration and
application release symlinks unchanged.

The initial publisher stores its private configuration backup and hash journal
under `/etc/prophotoacademy-staging/social-preview-release`, outside the public
directory. Its guarded installation checks the inspected Nginx hash, artifact
hash, application releases, process IDs and runtime hashes before and after the
change. It refuses an existing gallery destination rather than overwriting it.
For later replacements, inspect the current state afresh; do not rerun a one-time
installer with stale release/configuration guards.

The reviewed publisher is retained as the root-owned `0600` file
`/etc/prophotoacademy-staging/social-preview-release/publish-gallery.py` so its
guarded rollback remains available after temporary-upload cleanup or a reboot.
The journal directory is root-owned `0700`; none of it is served by Nginx.

## Replacement, checks and rollback

1. Record the source commit, HTML byte count and SHA-256. Back up the current
   gallery file and effective Nginx configuration before changing either.
2. Upload to a temporary filename inside the dedicated gallery directory.
   Compare the server SHA-256 and byte count with the local artifact. Set ordinary
   static-file permissions, then atomically rename it to the served filename.
3. When adding or changing locations, run `nginx -t` before reloading. On syntax
   failure restore the saved configuration; never reload an invalid configuration.
   Replacing HTML alone needs no reload or application restart.
4. Fetch both exact gallery URLs anonymously. Verify status 200, the headers above,
   the complete response SHA-256, 33 sections and 66 images. Check a nonexistent
   child path returning 404. Open the HTTPS gallery
   on desktop/mobile and verify the download action.
5. Confirm production does not serve this artifact at `/social-previews/`, and
   staging's existing homepage, health route and application release are unchanged.
   Record these checks with the release evidence.
6. Keep one previous verified gallery artifact. To roll back its content, verify
   that artifact's recorded hash and atomically restore it; browsers may retain
   the prior response for up to five minutes. To remove the route,
   remove only its marked staging locations, test Nginx and reload. Do not restore
   an old whole-site configuration over unrelated later changes.

This static artifact is separate from application-release cleanup. Never remove
application releases, private teaching files, databases or other sites while
replacing the gallery. See [the artwork guide](SOCIAL_PREVIEWS.md) for the design
and metadata contract; the gallery does not invalidate social-app preview caches.

### Roll back the initial gallery publication

Run the durable helper's read-only check first, then apply only after reviewing
its result:

```sh
sudo python3 /etc/prophotoacademy-staging/social-preview-release/publish-gallery.py --rollback
sudo python3 /etc/prophotoacademy-staging/social-preview-release/publish-gallery.py --rollback --apply
```

It verifies the current shared Nginx configuration, artifact, application releases,
process IDs and runtime hashes against its journal before restoring the original
configuration and removing only the gallery HTML. A guard failure requires a new
inspection and scoped rollback plan; do not bypass the hash checks.

**Roll back the gallery before the older production-application release.** That
application's rollback checks the complete shared Nginx fingerprint captured
before the gallery was added. The gallery rollback restores that fingerprint;
do not modify the application journal to accept a different configuration. After
either rollback, recheck both applications' health and the intended gallery state.
The initial publication's evidence is in
[the release record](releases/2026-11-11-staging-social-gallery.md).
