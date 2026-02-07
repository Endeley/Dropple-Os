# 003 - CCM Node Truth

Status: Accepted

## Decision

CCM is the only durable node truth.

- Rendering projects CCM; it does not mutate CCM.
- Exporters compile from CCM truth.
- Viewport state is not node truth.

## Why

- Keeps output deterministic
- Keeps framework exports trustworthy
- Prevents rendering-time corruption

## References

- `docs/LAW.md`
- `docs/architecture/ccm.md`
- `docs/architecture/rendering.md`
