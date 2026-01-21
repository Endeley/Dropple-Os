# CCM Marketplace Eligibility Rules

(What Can Be Sold, Shown, and Trusted)

Status: Design-locked  
Implementation: ❌ Not yet  
Scope: Marketplace trust, safety, long-term compatibility

## 1. Purpose

These rules define which CCM v1 templates are eligible to appear in the
marketplace and under what conditions.

The marketplace is a trust surface, not just a gallery.

Eligibility rules exist to ensure:

- Buyers get deterministic, safe templates
- AI and human templates behave identically
- No editor/runtime surprises
- Long-term compatibility guarantees

## 2. Core Marketplace Principle (Non-Negotiable)

Only fully validated, human-approved CCM v1 templates may enter the marketplace.

No previews. No "almost CCM". No legacy artifacts.

## 3. Eligibility Prerequisites (All Required)

A template is marketplace-eligible only if all conditions below are true.

### 3.1 CCM Validity

- Must pass validateTemplateArtifact
- Must conform exactly to CCM v1 schema
- Must contain only these top-level keys:
  - metadata
  - structure
  - motion
  - params
  - runtime
- Any extra keys → ineligible

### 3.2 Migration Status

- Must not have legacyOnly: true
- If converted from legacy:
  - Must have a successful migration audit report
  - Must show decision.outcome === "converted"
  - Must have no unresolved blocker reasons

### 3.3 Approval Authority

- Must be approved by a Marketplace Reviewer
- Approval must be recorded in the audit report:
  - authority.reviewedBy
  - authority.approvedAt

AI or system approval alone is never sufficient.

## 4. Structural Eligibility Rules

Marketplace templates must:

- Have exactly one root
- Have no cycles in structure.tree
- Use only known, supported component types
- Avoid editor-specific layout hacks
- Dynamic or runtime-computed structure → ineligible

## 5. Motion Eligibility Rules (Strict)

Allowed:

- Static timelines
- Deterministic keyframes
- Allowed properties only:
  - opacity
  - translateX
  - translateY
  - scale
  - rotate

Forbidden:

- Interaction-driven motion
- Conditional timelines
- Physics-based animation
- Randomized effects
- Preview-only transitions

If motion cannot be explained as pure data, it cannot be sold.

## 6. Params Eligibility Rules

Marketplace templates may expose params only if:

- Param types are from the approved list:
  - string
  - number
  - enum
  - token
  - preset
  - asset
- Defaults are valid and type-safe
- Params do not:
  - Change structure
  - Define motion logic
  - Introduce side effects

Ambiguous params → must be inlined or removed.

## 7. Runtime Safety Rules

Marketplace templates must set safe runtime defaults:

runtime.marketplaceSafe === true

Export rules:

- export.code defaults to false
- export.motionVideo may be true or false

Viewport rules:

- Must explicitly declare supported viewports
- No "auto", "responsive", or inferred behavior

## 8. Metadata Requirements (Marketplace-Facing)

Required:

- metadata.name
- metadata.version
- metadata.engine
- metadata.license

Optional:

- metadata.author
- metadata.description

Forbidden in CCM:

- Pricing
- Thumbnails
- Ratings
- Sales metadata

Those belong to the marketplace layer, not the template.

## 9. AI-Generated Templates (Special Rules)

AI-generated templates:

- Are treated identically to human templates at runtime
- Must pass all eligibility checks
- Must receive human marketplace approval
- Must be auditable (generation + approval trail)

AI can author templates. Humans decide what is sold.

## 10. Ineligible Template Classes (Explicit)

The following are never marketplace-eligible:

- Legacy templates
- legacyOnly: true templates
- Partially converted artifacts
- Templates with warnings marked as "blocker"
- Templates that bypass validator checks
- Templates requiring editor/runtime context

## 11. Enforcement Expectations (Future)

When implemented, the system must:

- Block marketplace ingestion if any rule fails
- Surface human-readable rejection reasons
- Preserve audit trails permanently
- Never silently downgrade eligibility

## 12. Invariants This Protects

- Buyer trust
- AI determinism
- Runtime stability
- Long-term compatibility
- Legal and reputational safety

## 13. Final Rule (Hard Lock)

If a template cannot be trusted without explanation, it does not belong in the
marketplace.

## 14. Status

- ✅ Defined
- ✅ Locked
- ✅ Migration-ready
- ❌ Not implemented (by design)
