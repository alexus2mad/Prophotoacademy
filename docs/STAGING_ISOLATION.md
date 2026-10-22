# Separate staging and production

## Provisioning status (22 October 2026)

The OVH server is 54.39.230.141 (SSH 58222). Production currently runs as
prophotoacademy on loopback port 3140, under /srv/prophotoacademy, with its
existing Supabase project bydmqmrbfjufsyhlayku and private Sanity learning data.

Prepared staging resources:

- Linux account and release root: prophotoacademy-staging, /srv/prophotoacademy-staging.
- Service: prophotoacademy-staging.service, loopback port 3141, 75% CPU and 768 MB memory ceiling.
- Root-owned configuration: /etc/prophotoacademy-staging/runtime.env (0600).
- Supabase: jxfyofiqhjmiguujrtdd, ProPhotoAcademy Staging, Ireland.
- Seven Academy migrations applied to a new empty database; no production users copied.
- Restricted prophoto_academy_runtime role, RLS enabled, private learning storage bucket.
- Sanity: p0dn7nmp, ProPhotoAcademy Staging, separate private learning-staging dataset.
- New source archive is the currently deployed application revision 5e51620e28df954d79a7ea8651924b2dead58122.
- Production source has local uncommitted email/schema edits; these are deliberately excluded.

Activation is pending credential transfer approval and final configuration.
The staging service is not running, and nginx still sends both domains to production.
Do not describe staging as isolated for users until the routing cutover is verified.

## Staging deployment

Install the reviewed scripts as root:

- validate-staging.py -> /usr/local/lib/prophotoacademy/validate-staging.py (0644).
- build-staging.sh -> /usr/local/sbin/academy-build-staging (0755).
- activate-staging.sh -> /usr/local/sbin/academy-activate-staging (0755).

Upload a git archive to /srv/prophotoacademy-staging/incoming/FULL_SHA.tar.gz.
Then run:

    sudo academy-build-staging FULL_SHA
    sudo academy-activate-staging FULL_SHA

Build and activation are separate. Neither command switches production.
Builds use an isolated systemd unit, a separate package cache, a 1 CPU quota,
and an 1800 MB memory cap. Activation checks staging health and rolls back on failure.
The service runs the environment guard before every startup. No production
database reference, live payment mode, Make hook, Resend key, booking bridge key,
or production Sanity project is permitted.

The first staging version uses mock payments: no charges or course grants.
No email-delivery timer is enabled for staging. Supabase Auth is independent;
its own email settings must be configured separately. Use synthetic accounts.

## Remaining cutover checks

1. Store the approved staging-only server keys; verify the guard passes.
2. Configure staging authentication origin and code-based emails.
3. Build and health-check staging; verify its keys access only the staging projects.
4. Build production with production public URLs and update its runtime origins.
   Do not rebuild or overwrite the active release directory.
5. Route staging nginx traffic to 3141. Preserve the old exact WayForPay callback
   path as a proxy to production for previously issued payment requests.
6. Move booking's signed bridge origin to production or preserve its exact
   integration endpoint during transition. Do not pass its credential to staging.
7. Verify authentication, mutation-origin checks, storage separation, payment modes,
   public redirects, and noindex on staging. Keep production online.
8. Retain the active release and previous verified rollback independently per
   environment. The existing prune-releases.py is production-only; never run it
   against staging by changing paths casually.
9. Record verified activation and rollback revisions here.

No automated production CI workflow currently exists in this repository.
A future workflow must use separate deployment credentials and explicit production
promotion; sharing the ubuntu administrative SSH key with staging CI would defeat
the intended deployment isolation.

Both environments share the VPS kernel, disk, network and nginx. Resource limits
reduce interference but do not provide the availability isolation of two servers.
