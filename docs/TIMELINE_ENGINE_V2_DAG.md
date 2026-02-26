# Timeline Engine v2 — Deterministic DAG Edition

## Overview

Timeline history is now an immutable Snapshot DAG:

- Linear history is replaced by a directed acyclic graph of snapshots.
- Snapshot identity is structural: `snapshotId === hashTimeline(timeline)`.
- Branching is supported.
- Duplicate structure collapses into a single snapshot node.
- Determinism and export stability remain intact.
- Labels are metadata only (non-structural).

## Structural Identity Law

- Snapshot id MUST equal `hashTimeline(snapshot.timeline)`.
- Snapshot identity is structural, not temporal.
- UUID-based snapshot identity is forbidden.

## Immutability Law

- Snapshot nodes are immutable.
- `timeline` inside a `SnapshotNode` must never mutate.
- If structure changes, a new snapshot must be created.

## Metadata Separation Law

- Snapshot metadata is stored separately from nodes.
- Metadata does not affect `timelineHash`.
- Metadata does not affect evaluation hash.
- Metadata must never alter export stability.

SnapshotMeta shape (v2):

```
{
  label: string,
  createdAt: number,
  updatedAt: number
}
```

## Determinism Preservation

- Evaluation output must remain identical across snapshot traversal.
- Branching must not introduce evaluation drift.
- Export gate must validate from any snapshot.

## Controller Semantics

- `dispatch` creates a new node only if the structural hash changes.
- Identical structure collapses to an existing node.
- `undo` traverses the first parent.
- `redo` traverses the single child (only if exactly one).
- `checkoutSnapshot` switches the head only.

## Explicit Non-Goals (v2)

- No multi-parent merges
- No snapshot pruning
- No structural merge logic
- No timeline mutation inside node

## Why This Matters

This document prevents entropy. It forbids:

- Mutable snapshot nodes
- Labels tied into hashing
- Rewriting parent links
- UUID snapshot identities
- UI mutation of snapshotGraph

Timeline Engine v2 is a structural contract, not a feature.
