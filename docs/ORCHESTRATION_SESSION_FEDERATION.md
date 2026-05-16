# Orchestration Session Federation

This phase establishes deterministic orchestration primitives for federated
interaction sessions.

## Scope

- Canonical session envelope for federated participants.
- Explicit lifecycle transitions (`attach`, `detach`, `seal-commit`, `close`).
- Deterministic invariant failures encoded as structured payloads.

## Initial Proofs

- `runtime/orchestration/sessionFederation.js`
- `runtime/orchestration/__tests__/sessionFederation.test.mjs`

