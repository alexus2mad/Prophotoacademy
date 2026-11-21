# Credential and dataset boundaries

The marketing editor uses SITE_EDITOR_WRITE_TOKEN. Existing non-staging installations may continue to use their configured general marketing token. Staging is recognized at runtime by its Academy origin, its staging project or its staging learning dataset. Its only accepted marketing target is the public production dataset in project p0dn7nmp. The independently hosted production project has a different ID.

The pre-start validator rejects an enabled editor without a dedicated credential, a token reused for private learning, a general write token, or an incorrect marketing target. Review builds strip the editor secret. Proof uses synthetic credentials and the existing SDK adapter with no network writes.
