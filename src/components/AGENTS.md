# Component rules

Follow the repository [AGENTS.md](../../AGENTS.md) and [ARCHITECTURE.md](../../ARCHITECTURE.md).

Before adding a component, identify its single responsibility and lowest appropriate layer. Reuse existing atoms and molecules when their semantics fit. Keep one PascalCase component in its matching folder/file, its contracts in `types.tsx`, and stateful logic in `hooks.tsx`.

Do not import upper layers, server content readers, database code, Node APIs or Sanity clients into the UI tree. Receive explicit props and use pure domain selectors. Keep native semantics and existing customer-flow behavior. Run the architecture guard and verify the changed interaction before committing.
