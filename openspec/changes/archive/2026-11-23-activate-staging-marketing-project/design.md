## Project boundary

The Academy runtime and embedded Studio keep their existing Sanity project, dataset and credentials. A server-only `SITE_EDITOR_PROJECT_ID` selects the public page editor's marketing project in staging. The application and pre-start guard require `3k86g5dt/production` for staging marketing and preserve `p0dn7nmp/learning-staging` for teaching. Staging published reads are anonymous, while draft reads, document mutations and image uploads share only the marketing project's writer. Image validation and stored asset references use the same marketing destination.

## Activation

Use the existing idempotent page seed, preserve the original About text and image, and take a public page inventory. Edit and save through a staging administrator session, check draft isolation from a signed-out browser, publish and reload, then restore the original values. Compare production's release and runtime configuration before and after. Roll back the staging release together with its prior read-only runtime settings if activation fails.
