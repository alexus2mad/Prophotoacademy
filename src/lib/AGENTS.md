# Domain rules

Follow the repository [AGENTS.md](../../AGENTS.md) and [ARCHITECTURE.md](../../ARCHITECTURE.md).

Keep domain logic independent of the Atomic Design layers. Put each domain's authored contracts in `<domain>/types.tsx` and use type-only imports. Prefer small pure selectors for display decisions. Keep content transport, durable persistence, security checks and integration adapters on the server.

Do not move payment validation or availability decisions into browser-only hooks. Preserve idempotency, verified prices, rate limits, consent distinctions and operations authorization. Do not duplicate schema-inferred types. Test behavior at external and persistence boundaries rather than mirroring implementation.
