# Dropple Persistence Authority v1

Status: locked for core completion

## Canonical Truth

Dropple's canonical replay truth is the local event snapshot:

- `events`
- `cursorIndex`
- local metadata

Runtime state is always derived from replay/hydration.

## Boot Path

The active editor boot path is:

`local snapshot -> hydrateRuntimeSnapshot -> dispatcher.hydrateRuntimeState`

This is the only canonical editor boot path.

## Remote Role

Convex is not the editor's primary truth owner.

Convex is used for:

- remote sync
- sharing/publishing
- collaboration substrate
- durable replication

Remote snapshots and remote event append APIs must not be treated as equal
authority to the local replay snapshot.

## Hard Rules

- local replay snapshot is canonical
- runtime state is never persisted as truth
- projection state is never persisted as truth
- computed/derived state is never persisted as truth
- remote sync is secondary to local canonical truth

## Naming Rule

Local persistence surfaces must read as local authority.
Remote persistence surfaces must read as sync or remote access.

Do not name remote sync helpers as if they are the canonical save/load path.
