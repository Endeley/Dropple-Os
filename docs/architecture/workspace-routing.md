# Workspace Routing & Authority

## Single Dispatcher Rule

DispatcherProvider is owned exclusively by WorkspaceRoot.

No other subtree may create a dispatcher.

## Routing Requirement

All `/workspace/*` routes MUST be descendants of WorkspaceRoot.

Violations cause:

- silent intent drops
- missing mutations
- non-deterministic UI
