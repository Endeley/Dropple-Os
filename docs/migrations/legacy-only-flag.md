# Legacy Templates — legacyOnly: true Semantics

Status: Design-locked  
Implementation: ❌ Not yet  
Scope: Documentation + contract only

## 1. Purpose

The legacyOnly: true flag exists to explicitly mark templates that are not
CCM v1-compatible and must never be silently migrated or treated as CCM
artifacts.

This flag prevents:

- Accidental conversion
- Trust erosion in the marketplace
- Silent loss of behavior
- "Half-CCM" templates entering runtime

## 2. Definition

A legacy-only template is a template that:

- Was authored under the legacy snapshot/event system
- Depends on editor/runtime behaviors not expressible in CCM v1
- Has not been explicitly converted via a validated migration path

Such templates are marked:

legacyOnly: true

This flag is authoritative.

## 3. Semantics (Non-Negotiable)

When legacyOnly: true is present:

Prohibited:

- Cannot be treated as a CCM v1 Template Artifact
- Cannot enter the CCM marketplace
- Cannot be used by AI variant generation
- Cannot be auto-converted
- Cannot be silently upgraded
- Cannot be exported as CCM

Allowed:

- Can be previewed in legacy editors
- Can be used in legacy workspaces
- Can be duplicated as legacy
- Can be manually reviewed for conversion
- Can coexist with CCM templates

## 4. Relationship to Legacy → CCM Conversion

| State | Meaning |
| --- | --- |
| legacyOnly: true | Explicitly excluded from CCM |
| No flag | Unknown — requires audit |
| Converted | Becomes a CCM artifact, flag removed |

Conversion must:

- Remove legacyOnly
- Produce a validated TemplateArtifactV1
- Be one-way

## 5. How the Flag Is Set (Future)

The flag may be set when:

- A template uses interaction logic
- Runtime layout mutation is detected
- Non-deterministic behavior exists
- Motion cannot be statically extracted
- Editor-only constructs are present

This decision must be:

- Explicit
- Logged
- Explainable

## 6. UI / UX Expectations (Design-Only)

When users encounter a legacy-only template:

- Show "Legacy Template" badge
- Explain why it cannot be migrated
- Offer "Learn more" link
- Do not offer "Upgrade" unless eligible
- No dark patterns. No silent behavior changes.

## 7. Interaction With AI Systems

AI systems must:

- Refuse to generate variants from legacyOnly templates
- Refuse to reference them as base artifacts
- Suggest manual redesign instead

This protects AI trust and determinism.

## 8. Why This Flag Matters (Critical Insight)

Without legacyOnly, the system is forced to guess intent. Guessing destroys
trust.

This flag:

- Makes technical debt visible
- Prevents accidental corruption
- Preserves user expectations
- Allows safe coexistence during transition

## 9. Invariants Protected

- CCM immutability
- Marketplace safety
- Replay determinism
- AI / human parity
- Migration auditability

## 10. Final Rule (Hard Lock)

If a template is not provably CCM-safe, it must be legacyOnly: true.

No exceptions.

## 11. Status

- ✅ Defined
- ✅ Locked
- ❌ Not implemented (by design)
