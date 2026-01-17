# N3 — Real-Time Editing (Design Only)

## Definition (Locked)

Multiple users can edit the same document concurrently and see changes applied to a shared document state in near‑real time, with conflict handling and shared undo.

N3 is **not** N2.

## N2 vs N3 (Hard Line)

Layer | N2 (Current) | N3 (Proposed)
---|---|---
Presence | ✔ | ✔
Cursors | ✔ | ✔
Intent | ✔ | ✔
Soft locks | ✔ (visual) | ✔ (optional)
Document mutation | ✖ local only | ✔ shared
Conflict handling | ✖ | ✔
Shared undo | ✖ | ✔
Determinism | Local | Global

## Non‑Goals (Locked)

- Google‑Docs‑style per‑keystroke syncing
- Hard locks by default
- Implicit background sync
- "Magic" merging without rules
- Rewriting the runtime

## Architectural Options

### A) Server‑Authoritative

Server is the source of truth.
Clients send ops; server rebroadcasts merged ops.

Pros: simple mental model, shared undo.
Cons: latency‑sensitive, breaks local‑first, infra heavy.

### B) Client‑Authoritative + Merge (Local‑First RT)

Each client edits locally; ops are merged across peers.

Pros: preserves local‑first, offline‑friendly.
Cons: hardest to design correctly.

### C) Hybrid (Recommended)

Local‑first editing remains canonical.
Server hosts a shared operation log.
Clients converge by replaying ops.

Matches existing event/timeline architecture.

## Recommended Direction: Operation‑Based Shared Log

### 1) Shared Operation Log (Per Branch)

Each edit becomes an operation:

- append‑only
- timestamped
- actor‑identified
- replayable

Example op:

```json
{
  "opId": "uuid",
  "actorId": "user-123",
  "type": "move",
  "targetIds": ["node-1"],
  "delta": { "x": 10, "y": 0 },
  "baseRevision": 42
}
```

### 2) Local Optimistic Application

Edits apply immediately locally.
Ops are emitted to the server.
UI never waits on network.

### 3) Deterministic Merge Rules (Required)

Examples:

- Move vs move → last‑writer‑wins
- Move + resize → apply both
- Delete vs move → delete wins
- Order by (revision, timestamp, actorId)

Rules must be explicit, documented, testable.

### 4) Shared Undo (Scoped)

Recommended: **Per‑user undo**.
Avoid global undo in v1.

## Awareness vs Authority

N2 signals remain non‑authoritative:

- Intent ≠ lock
- Cursor ≠ ownership
- Soft lock ≠ enforcement

Authority comes only from merged ops.

## Conflict UX (Minimal)

Small snap‑back, brief highlight, no modals.
Conflicts are resolved, not debated.

## Failure & Offline Model

- Queue ops locally
- Retry on reconnect
- Rebase against latest revision

Op‑log model simplifies this.

## Security & Permissions

Only editors can emit ops.
Server validates:

- role
- target existence
- op shape

Server does not interpret layout math.

## Rollout Strategy (If Implemented)

Opt‑in:

- per document
- per branch
- per workspace mode

## Decision Gate

Implement N3 only if:

- users demand true real‑time editing
- async collaboration is a bottleneck
- bandwidth exists for correctness and testing

Otherwise: **do not start N3**.
