## Approach

Use the guarded isolated-builder procedure from the 23–24 November releases. The toolkit lives in the ignored `.data/agent-rule-release-20261124/`.

1. Pin each environment's public build settings from its runtime file, allowing only whitelisted keys. Build the release revision once per environment on `isolated-builder` from a `git archive`, then transfer and checksum-verify the artifact and extract it as an inactive release.
2. **Staging:** check the runtime digest, the startup guard and the marketing project `3k86g5dt`. Then run `academy-activate-staging`, which checks health and rolls back on failure.
3. **Production** (only after staging is verified): require the runtime digest, minus the editor keys, to equal the recorded production contract. It must have `PAYMENT_MODE=wayforpay`, `SEO_INDEXABLE=true`, Supabase `bydmqmrbfjufsyhlayku` and marketing project `qy8emt0h`. Start a loopback candidate on port 3142 and check database health, the food landing and anonymous editor denial. Then switch `current` atomically and restart, rolling back automatically on failure.
4. Check the live HTTPS paths, then run the guarded prune helper for each environment against its captured previous SHA.

## Non-goals

No change to runtime environment files, nginx, Sanity datasets, database schema or payment settings. No test order is created on production.
