# Staging social-image gallery — 11 November 2026

Published [the complete social-image gallery](https://staging.prophotoacademy.com.ua/social-previews/) after production release `538e07126e3de2c31028b6e9aa5086e8bb552c64` had passed verification and release cleanup.

The gallery contains 33 page-family sections, all 66 branded JPEG previews, and matching image downloads. Its self-contained HTML has no scripts, external resources, private data, or local filesystem paths. The published artifact is 9,041,509 bytes with SHA-256 `1636a9a2f28798f17dbcbedff250685c14344418aaf8883e7523ae2fa9a41a89`.

## Serving and isolation

Nginx serves `/social-previews/index.html` from `/var/www/prophoto-social-previews/index.html`. The exact `/social-previews/` URL internally rewrites to that index location; it does not redirect the visitor. Other paths below `/social-previews/` return 404. Production does not expose the gallery.

Both gallery URLs return UTF-8 HTML with `noindex, nofollow, noarchive`, `nosniff`, `no-referrer`, a five-minute cache limit, and a restrictive content security policy allowing only embedded images and inline styles. Only GET and HEAD are allowed.

The insertion is confined to the existing staging HTTPS server. Production virtual-host blocks, payment callback routing, and application upstreams remain byte-for-byte unchanged. No Next.js service restart, runtime change, application release change, or database operation was required. Production remained on `538e071`; staging remained on `2bf9515a1667e40bdadf95caea2dc0ec60b28072`. Their process IDs remained `133080` and `126028` respectively throughout publication.

## Verification and rollback

- Nine offline deployment guard tests passed, including exact URL scope, security headers, source hash, and unchanged non-staging server blocks
- The proposed configuration passed an isolated nginx syntax check before activation; the active configuration passed `nginx -t` before reload
- All 153 live checks passed: both HTML hashes, all 66 JPEG previews and downloads, response headers, unknown/private path denial, production isolation, and both application health endpoints
- Browser review confirmed all 33 designs and 66 images at 775px and 390px viewport widths, with no horizontal overflow on mobile; screenshots are retained privately under `.data/social-gallery-public/`
- A guarded rollback dry-run passed after publication, confirming unchanged process IDs and runtime hashes

The original shared nginx configuration remains preserved under `/etc/prophotoacademy-staging/social-preview-release/before-nginx.conf`, with SHA-256 `de6c9f6d7d1512ae1d4767d9936dcb33bb2655e3d4c41ff58875f121a81043ed`. The gallery journal records the final configuration hash `750f2d1366b0c9e5c476076e2399851d06d0bfd4f4a340391728597ce92b4002`.

The reviewed rollback helper is retained at `/etc/prophotoacademy-staging/social-preview-release/publish-gallery.py`, root-owned mode 0600, independently of temporary upload paths. Its rollback dry-run passed. Five checksum-verified operator transfer copies were removed after verification.

**Roll back this gallery before using the guarded production-application rollback.** That restores the nginx fingerprint captured by the application release journal. The application journal was not edited. See [the gallery operating guide](../STAGING_SOCIAL_GALLERY.md) for publication and rollback procedures.
