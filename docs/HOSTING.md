# Academy hosting and deployment

Current infrastructure as of 31 October 2026 (Europe/Kyiv). This page supersedes
the host addresses and provisioning status in older deployment notes.

## Server and access

Production and staging run on the Hetzner Ubuntu server **188.245.178.173**.
Connect as **prophoto-admin**, using an authorized SSH key on port **58222**.
Password authentication and direct root SSH are disabled. The administrator has
owner-approved passwordless sudo; application accounts cannot log in by SSH.

From the repository root, the checked-in profile uses the pinned public host key:

```sh
ssh -F deploy/ssh-config.example prophoto-new
```

The profile expects the operator's private key at `~/.ssh/id_ed25519`. Supply
`-i /path/to/authorized/key` if needed. No private key is stored in this repository.
The server's Ed25519 fingerprint is
`SHA256:QhovN+kf41tb+n8VmXksvQFyNTC0vfSkQWC0WxfWmEM`. Investigate an unexpected
host-key change; do not disable strict checking. This Windows operator also has
the `ssh prophoto-new` alias in their personal SSH configuration.

UFW permits inbound TCP 58222, 80 and 443. Applications listen on loopback only.
Fail2ban, automatic security updates, AppArmor and bounded persistent journals
are enabled. Automatic reboots are disabled; schedule them for kernel updates.

## Live environments

| Setting | Production | Staging |
| --- | --- | --- |
| Origin | https://prophotoacademy.com.ua | https://staging.prophotoacademy.com.ua |
| Source branch | `codex/student-production` | `codex/photographic-editorial` |
| Account / service | `prophotoacademy` | `prophotoacademy-staging` |
| Loopback port | 3140 | 3141 |
| Release root | `/srv/prophotoacademy` | `/srv/prophotoacademy-staging` |
| Runtime configuration | `/etc/prophotoacademy/runtime.env` | `/etc/prophotoacademy-staging/runtime.env` |
| Active application SHA at migration | `5ae3eca80dbb9e8eb1bb1203343be16d99ba591a` | `d5c3fb87216758f57dc9dd8f98801a2c82cea33b` |
| Previous verified release | `aa6f6aa4630be415d02d120732e5df795da6b5dd` | `d4cdd895a3f52dedac7b2614e8c47a825a3dd296` |
| Supabase project | `bydmqmrbfjufsyhlayku` | `jxfyofiqhjmiguujrtdd` |
| Sanity project / learning dataset | `sfzp6094` / `learning` | `p0dn7nmp` / `learning-staging` |
| Payment mode | `wayforpay` | `mock` |

`current` selects the active release under each release root. Exactly the active
build and one previous verified build are retained per environment. A later
documentation commit on a branch does not change the running application SHA.
The default `main` branch is not an automatic production deployment source.

Supabase databases, authentication, private storage and Sanity remain in their
existing external projects. Production and staging data and credentials remain
separate. Runtime files are root-owned mode 0600; database connections retain
their restricted runtime roles, session-pooler endpoints and full TLS verification.
The staging startup guard rejects production configuration. Staging sends
`X-Robots-Tag: noindex, nofollow, noarchive`.

Both invitation/email retry timers run on this server only:
`prophotoacademy-email.timer` and `prophotoacademy-staging-email.timer`.
Staging uses its own invitation credential. No production credentials were added
to staging. The exact legacy staging WayForPay callback path continues to route
to production, preserving already-issued payment callbacks.

## Deployment procedure

Deployment is manual over SSH. At migration, GitHub has no server-deployment
workflow, Actions deployment secrets or deployment variables to retarget. Its
only Actions workflow publishes the separate static GitHub Pages review.
Pushing any application branch does not deploy the server.

1. Select the intended environment and its source branch. Commit and test the
   application using the repository's verification rules. Do not merge staging
   into production as part of an infrastructure change.
2. Connect to `prophoto-new`. Read the installed service and deployment helpers
   before changing them. `/usr/local/sbin/academy-build-production`,
   `/usr/local/sbin/academy-build-staging` and
   `/usr/local/sbin/academy-activate-staging` were retained during migration.
   The legacy ambiguous `academy-build` command refuses to run.
3. Use a clean Git archive of the selected full SHA and Linux-compatible build
   dependencies. Preserve each environment's build-time public configuration;
   a staging build cannot be activated as production unchanged.
4. Build and verify a candidate separately from the active release. Activate only
   the intended service, check its database health and affected HTTPS journeys,
   then retain exactly the active and previous verified release. Follow the
   applicable activation and retention rules in
   [staging isolation](STAGING_ISOLATION.md) and
   [production deployment](PRODUCTION_DEPLOYMENT.md).

**Build capacity:** this server has approximately 1 GB RAM and 1 GB swap. The
inherited build helpers allow up to 2200 MB RAM and 1536 MB swap; those limits do
not reserve or provide memory. Do not run a full build alongside both live apps
without a capacity plan. Use an appropriately sized Linux builder with the
correct environment-specific public settings, or arrange more server memory.
The migration copied the existing verified Linux builds without rebuilding them.

Basic read-only checks after deployment:

```sh
sudo systemctl is-active nginx prophotoacademy prophotoacademy-staging
sudo systemctl list-timers 'prophotoacademy*-email.timer' certbot.timer
curl --fail https://prophotoacademy.com.ua/api/health
curl --fail https://staging.prophotoacademy.com.ua/api/health
```

## DNS, certificates and migration rollback

The apex, `www` and `staging` A records all point to `188.245.178.173`, with a
one-hour TTL. `www` redirects to the apex. Existing mail MX/TXT/CNAME records
were preserved. Certificates and their restricted renewal configuration were
transferred; `certbot.timer` renews through the nginx reload hook. Public HTTP
challenges use `/var/www/prophoto-acme`, a root-owned mode 0755 directory outside
the private application roots. Keep this path consistent in nginx and all three
Certbot renewal configurations. HTTP ACME challenges must remain reachable on
port 80. `deploy/nginx-environments.conf` describes the current domain routing;
the original single-environment HTTP/HTTPS templates are historical setup aids.

Old origin **54.39.230.141** is retained temporarily as an HTTPS forwarding
server for cached DNS clients and as a rollback copy. Its application services,
email timers and certificate timer are stopped and disabled. Do not deploy to
it or start duplicate workers. The new nginx trusts forwarded client addresses
only from this old origin through
`/etc/nginx/conf.d/prophoto-migration-realip.conf`.

The old nginx configuration is backed up on the old host at
`/root/prophoto-migration-20261031/prophotoacademy.conf.before-forwarding`.
For a full infrastructure rollback, first stop the new scheduled workers, then
restore and validate the old nginx configuration, start and health-check the old
applications and workers, and deliberately move the three A records back.
External databases are shared with the preserved old builds: do not restore a
database snapshot or run schema changes as part of a host rollback.

After the DNS transition and an agreed observation period, the old host can be
retired and its real-IP trust entry removed from the new host. Do not delete the
rollback host as an incidental release-cleanup operation. Booking remains on
`46.224.208.120`; its domain-based Academy integration was preserved.
