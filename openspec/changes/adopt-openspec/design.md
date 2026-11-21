# Adoption design

## Decisions

1. Use OpenSpec 2.1.1's standard schema, project skills and repository-local specs. The pnpm script pins the CLI through dlx, keeping the tool out of the deployed dependency tree. CI uses the same command as a contributor.
2. Use a clean worktree at the agreed commit. Keep customer-facing work in progress out of the baseline. Write an index of concrete entry points backed by capability scenarios and an evidence guide per domain. Read source and tests before relying on historical documentation.
3. Separate observed behavior, intended behavior and unresolved evidence. Keep traceability at the entry point and capability level. Customer records, mutable prices, private assets and credentials are inappropriate baseline material.
4. Root agent guidance owns the workflow, scoped files own local engineering constraints, and vendor skill files remain reproducible. Explicit planning requests end with the plan. For implementation requests the CLI supports creating or updating artifacts and applying their tasks within the same request.
5. Use a machine-readable commit trailer and a read-only GitHub check. Resolve references against Git content and keep pre-adoption commits outside enforcement. Coverage checks must find new or removed entry points and invalid capability links.

## Verification and delivery

Check the active change, then the resulting canonical specifications and archived task list. Exercise the link checker with temporary Git histories. Run existing application checks in the clean worktree. Commit the adoption in stages and integrate only its verified commits. Hosting, payments, external messages, and branch-protection settings require no changes.
