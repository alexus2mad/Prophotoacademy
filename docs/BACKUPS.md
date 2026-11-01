# ProPhoto backup operations

Configured 31 October 2026. Production and staging run on `188.245.178.173`.
The paid OVH server at `54.39.230.141` stores their encrypted backups.

## Schedule and retention

- Nightly at **04:00 Europe/Kyiv**, with up to ten minutes of randomized delay.
- Retain **14 daily, 8 weekly and 12 monthly** snapshots; overlapping selections
  share a snapshot. Restic deduplicates and compresses the data.
- Every Sunday at **06:00 Europe/Kyiv**, read and verify all encrypted data,
  decrypt the latest server archive, verify critical files and every teaching
  object, and restore both application databases into temporary PostgreSQL
  instances. The verification databases have no TCP listener and are removed.
- Missed scheduled jobs run when the backup server comes back online.
- A failed export creates no successful snapshot. Retention runs only after a
  successful backup and integrity check. Existing snapshots are preserved if
  the backup disk has less than 5 GiB free; the unit then reports a failure.

## What is backed up

Each `server-external` snapshot contains `/prophoto-server.tar`, with paths
relative to the source server's root:

- `/etc`, including restricted runtime configuration, certificates, SSH,
  firewall, nginx and systemd configuration.
- `/usr/local`, the Node runtime under `/opt/ps-booking-node`, the administrator's
  authorized SSH keys, and both applications' active and rollback releases.
- Application shared data. Reproducible build caches and incoming build archives
  are excluded.
- A consistent PostgreSQL dump of the complete `academy` application schema for
  each Supabase project. Dumps retain schema definitions, data, indexes,
  constraints and RLS policies. The exporter uses read-only transactions and the
  existing restricted runtime role, without granting it additional privileges.
- Supabase Auth user records and public Auth settings through the Admin/API
  endpoints. These are **not** a physical backup of the provider's internal Auth
  database: password hashes, live sessions and control-plane secrets/settings
  are not included. Reconfigure provider settings during a new-project recovery;
  use provider backups when full internal Auth state is required.
- Supabase bucket configuration and every current Storage object, including
  private teaching files. A manifest maps hashed local filenames to bucket/object
  paths and records SHA-256 checksums. Unchanged objects are reused only after
  checking their cached contents.
- All accessible Sanity datasets in both Academy projects, including drafts,
  asset documents and their asset files.
- Package versions, enabled units, active/rollback release identifiers, export
  timestamps and verification manifests.

Database snapshots are internally consistent. Database, Auth, Storage and Sanity
exports have separate timestamps; this is not one atomic cross-provider snapshot.
Booking's own database and other websites are outside this Academy backup scope.

## Access and security

The backup server **pulls** from the web server. Its dedicated SSH key is stored
only in root-protected `/etc/prophoto-backup/source_ed25519` on the backup server.
On the web server, `backup-export` accepts that key only from `54.39.230.141` and
can run only the fixed backup exporter. Password login, forwarding and interactive
shell access are disabled. It has no general sudo permission. The production
server has no repository password or SSH credential for deleting these backups.

The exporter runs with CPU and memory limits and writes temporary provider exports
to root-only `/var/lib/prophoto-backup/export` on the web server. The archive is
streamed over host-key-pinned SSH. On the backup server, Restic encrypts it using
a random password in root-only `/etc/prophoto-backup/restic-password` and stores
it under `/srv/prophoto-backups/repository`.

The backup server administrator can decrypt the repository. Protect this host
and its administrator key as carefully as production. Encryption does not make
the repository immutable or protect it from a compromised backup-server root.

## Check status and run a backup

Connect with the existing administrator key:

```sh
ssh -p 58222 ubuntu@54.39.230.141
sudo systemctl list-timers 'prophoto-backup*'
sudo cat /var/lib/prophoto-backup/last-success
sudo cat /var/lib/prophoto-backup/last-restore-check.json
sudo journalctl -u prophoto-backup.service -n 30 --no-pager
sudo systemctl start prophoto-backup.service
```

Failures appear in systemd and `/var/lib/prophoto-backup/last-error`. This setup
does not send email or chat alerts. An external monitor should check freshness
if unattended failure notifications are required.

## Recovery

Choose the recovery scope before making changes:

- **Bad deployment:** use the previous verified application release on the web
  server, following `HOSTING.md`. Keep the current external data.
- **Lost web server:** rebuild a replacement Ubuntu host and restore server files
  and configuration. Keep the existing Supabase and Sanity projects when they
  are healthy. Test production and staging before changing DNS.
- **Deleted or damaged data:** choose a snapshot taken before the incident,
  restore into a separate recovery location, verify it, then recover the affected
  records or objects. Preserve the current state before replacing live data.

An independent recovery kit is encrypted to the operator's existing Ed25519 SSH
key and saved on their Windows machine at:

`E:\Projects\photoacademy\server-admin\backup\prophoto-backup-recovery.tar.age`

Another encrypted copy is `/srv/prophoto-backups/recovery.tar.age` on the backup
server. The kit contains repository access configuration and the backup SSH key;
the backup data itself is in the repository. Keep the existing SSH private key
safe: it is needed to decrypt the kit. Recovery-kit decryption was tested in
memory; no plaintext recovery credentials were saved on Windows.

To inspect snapshots on the backup server:

```sh
sudo -i
set -a
. /etc/prophoto-backup/restic.env
set +a
restic snapshots --host prophoto-new --tag server-external
restic check --read-data
```

To recover the complete archive into a separate private directory, substitute a
chosen snapshot ID from that list:

```sh
umask 077
mkdir -p /root/prophoto-restore
restic restore SNAPSHOT_ID --target /root/prophoto-restore
tar -tf /root/prophoto-restore/prophoto-server.tar
```

This produces the server archive for inspection and selective extraction. Allow
at least 4 GiB free for the archive at the initial project size, plus space for
any extracted files. Application database dumps and provider exports are under
`var/lib/prophoto-backup/export/prophotoacademy/` and
`var/lib/prophoto-backup/export/prophotoacademy-staging/` inside the archive.

Use an explicit verified snapshot ID when restoring. For example, extract one
configuration file into a private recovery directory without overwriting live data:

```sh
umask 077
mkdir -p /root/prophoto-restore
restic dump SNAPSHOT_ID /prophoto-server.tar |
  tar -xOf - etc/nginx/sites-available/prophotoacademy.conf \
  > /root/prophoto-restore/prophotoacademy.conf
```

For a replacement web server, use the package/user inventory, restore the selected
application and configuration paths with their ownership and permissions, adapt
network and SSH settings to the replacement host, and test both applications
before changing DNS. Recreate the runtime database role and restore the matching
`academy.dump` with `pg_restore`; do this against a recovery database first.
The dumps omit database role ownership and grants. Recreate roles and apply the
project's deployment grants before connecting the application to a replacement
database; copying a dump alone does not configure a new Supabase project.
Restore Storage objects using their manifests and the Storage API, and import
Sanity NDJSON/assets using the Sanity tooling. Preserve Auth user IDs when
reconstructing identities so existing application profiles retain their links.

The weekly verification uses temporary local databases and never restores over
either live Supabase project. An encrypted backup on this single backup VPS
protects against loss of the web server; an additional independent repository
would be needed to survive loss of both servers.
