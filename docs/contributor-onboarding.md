# Contributor Onboarding

Welcome to Dropple OS.

Before writing code, understand:

- You never mutate state directly
- You never bypass the dispatcher
- You never trust the UI for security
- You never break replay

## Folder Responsibilities

```
core/     → events & reducers
engine/   → layout & constraints
runtime/  → dispatcher & history
ui/       → canvas & panels
timeline/ → animation model
export/   → deterministic exporters
convex/   → persistence & auth
docs/     → authoritative documentation
```

## Where mutation is allowed

| Layer      | Mutates State |
|------------|---------------|
| UI         | ❌ |
| Sessions   | ❌ |
| Dispatcher | ✅ |
| Reducers   | ❌ |
| Convex     | ✅ |

If you can’t place a change in this table, stop and rethink.
