# DO NOT BREAK THESE RULES

These rules exist because the previous version failed without them.

## ❌ Do NOT duplicate tools
One tool. One definition. Many workspaces.

## ❌ Do NOT hardcode workspace logic into tools
Tools do not know where they live.

## ❌ Do NOT add floating inspectors
Inspector lives on the right. Always.

## ❌ Do NOT add half‑working UI
If a feature is not implemented:
- hide it, or
- make it read‑only

Never fake it.

## ❌ Do NOT let floating UI become mandatory
Floating UI is an accelerator, not a requirement.

## ❌ Do NOT mutate state outside intent resolvers
Ever.

## ❌ Do NOT add “just one exception”
That’s how the old project died.

---

## If You Want to Break a Rule
You must:
- Update the v1 UI Lock Document
- Bump the version
- Explain the reason in writing

No silent changes.
