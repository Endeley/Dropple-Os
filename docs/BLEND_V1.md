# Blend Mode Law (v1)

This document defines the deterministic blend semantics for the Dropple timeline engine.

## Allowed Blend Modes

- `add`
- `replace`

## Track Type Semantics

`standard`:

- `add` -> output = blend(prev, value)
- `replace` -> output = value

`overlay`:

- forced `replace` (blendMode ignored / coerced)

`mute`:

- ignored in evaluation

## Constraints

- Blend functions must be pure.
- Blend functions must be deterministic.
- No randomness.
- No time-dependent blending.
- No floating instability sources.
- No per-channel dynamic blend logic.

Future blend modes must preserve determinism, be canonicalizable, and be hash-stable.
