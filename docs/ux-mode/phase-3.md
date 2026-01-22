# UX Mode - Phase 3 Planning (Locked)

Status: PLANNING ONLY (No Implementation)

## Lock Declaration

UX Mode Phase 3 is now formally closed and immutable.

What is locked

- Declarative UX Mode contract
- Action classification (Safe / Soft-Unsafe / Hard-Unsafe)
- Semantic intent vocabulary
- UX signal propagation model
- Explicit non-goals

What is forbidden

- No runtime behavior changes
- No dispatcher interception
- No CCM schema changes
- No enforcement logic
- No permission systems

Phase 3 defines meaning only, not power.

This phase will never be reopened, only referenced.

## Phase 3 Canonical Summary (One-Paragraph)

UX Mode is a declarative workspace profile intended for review, validation, and experience testing. In this mode, actions are semantically classified by intent (safe, soft-unsafe, hard-unsafe) without enforcement. WorkspaceRoot remains the sole authority. Phase 3 establishes shared meaning across UI, CCM, and Dispatcher while explicitly deferring all behavioral control to later phases.

## Purpose of Phase 3

Phase 3 introduces semantic UX enforcement without changing execution authority.

Phase 1 showed identity
Phase 2 showed surface restriction
Phase 3 defines meaning

This phase answers:

- What does UX Mode actually mean at the system level?
- What guarantees does it provide?
- What it explicitly does NOT do (yet)?

## Core Principle (Non-Negotiable)

UX Mode Phase 3 is declarative, not authoritative.

- No runtime interception
- No dispatcher logic changes
- No mutation blocking at execution level
- No CCM schema changes
- No deletion or migration behavior changes

Phase 3 defines intent, not enforcement.

## Phase 3 Outcome (What Exists After This Phase)

After Phase 3, the system will have:

- A formal UX Mode Contract
- A canonical list of UX-safe vs UX-unsafe actions
- A shared semantic vocabulary across UI, CCM, and Dispatcher
- Future-proof hooks for Phase 4+ enforcement
- Zero breaking changes

## 1. UX Mode Contract (Definition Layer)

Phase 3 introduces a conceptual contract:

UX Mode Definition

UX Mode is a workspace profile in which:

- The system is optimized for review, validation, and experience testing
- Mutative intent is discouraged but not yet technically blocked
- All actions are interpreted through a UX safety lens

This contract is documentation + internal agreement, not code logic.

## 2. Action Classification Matrix (Key Deliverable)

Phase 3 formally classifies workspace actions.

Action Categories

| Category | Meaning |
| --- | --- |
| Safe | Can never cause structural or data mutation |
| Soft-Unsafe | Changes state but is reversible / scoped |
| Hard-Unsafe | Structural, persistent, or irreversible |

Example Classification (Draft)

Safe

- Canvas pan / zoom
- Selection
- Hover inspection
- Timeline scrubbing
- Read-only previews

Soft-Unsafe

- Local UI toggles
- Temporary layout changes
- Non-persistent filters
- View preferences

Hard-Unsafe

- Node creation
- Node deletion
- Graph rewiring
- CCM schema mutation
- Dispatcher state mutation

In Phase 3, this table is descriptive only, not enforced.

## 3. UX Intent Metadata (Concept Only)

Phase 3 defines - but does not yet require - a shared metadata concept:

intent: "safe" | "soft-unsafe" | "hard-unsafe"

Important constraints:

- NOT added to CCM yet
- NOT enforced by Dispatcher
- NOT required by UI yet

This is a semantic anchor for future phases.

## 4. UX Signal Propagation Model

Phase 3 defines how UX intent flows, without acting on it.

Conceptual Flow

WorkspaceRoot
   |-- profile = "ux-validation"
        |-- UX Context (read-only)
             |-- UI (already using)
             |-- Canvas (future)
             |-- Sessions (future)
             |-- Dispatcher (future)

Key rule:

WorkspaceRoot remains the single authority.

No component may infer UX Mode independently.

## 5. Explicit Non-Goals (Locked)

Phase 3 does NOT:

- Block dispatcher calls
- Alter execution paths
- Modify CCM validator rules
- Add runtime guards
- Prevent programmatic mutations
- Introduce permission systems

This avoids accidental Phase 4 leakage.

## 6. Why Phase 3 Exists (Strategic Reason)

Without Phase 3:

- Phase 4 becomes arbitrary
- Enforcement becomes inconsistent
- UX Mode risks becoming "just disabled buttons"

With Phase 3:

- Every future guard has a semantic basis
- UX Mode becomes a first-class system concept
- Enforcement can be layered safely and incrementally

## 7. Readiness Checklist for Phase 4

Phase 3 is complete when:

- UX Mode contract is documented
- Action classification matrix is agreed
- Intent terminology is stable
- No code changes were required
- All future enforcement points are identified (but inactive)

Only then does Phase 4 begin.

## Phase 4 Teaser (Not Planned Yet)

Phase 4 will likely introduce dispatcher-level awareness:

- Intent-aware guards
- Structured warnings
- Optional enforcement tiers

But Phase 3 must exist first.

## UX Mode - Phase 4 (Planning Only)

Phase 4 is planned separately and builds strictly on Phase 3 semantics.
No implementation yet.

Phase 4 Purpose

Introduce runtime awareness of UX intent - without immediately enforcing it.

Where Phase 3 defined meaning,
Phase 4 introduces consciousness.

Core Principle (Phase 4)

The system may observe UX intent before it ever blocks it.

Observation precedes restriction.

Phase 4 High-Level Goals

Phase 4 will:

- Make the Dispatcher UX-intent aware
- Surface structured warnings
- Enable graduated enforcement tiers
- Preserve reversibility and developer trust

Phase 4 Conceptual Layers

1. Intent Awareness (Read-Only at First)

Dispatcher receives:

- profile = "ux-validation"
- Action intent classification

No action is blocked initially

Outcome:
The system knows an action is unsafe - but allows it.

2. Structured UX Warnings

Instead of silent failure or hard blocking:

- Console / dev warnings
- UI banners
- Session logs

Example (conceptual):

\"This action is classified as Hard-Unsafe in UX Mode.\"

3. Enforcement Tiers (Planned, Not Active)

Phase 4 planning defines tiers, but does not activate them:

| Tier | Behavior |
| --- | --- |
| Observe | Log only |
| Warn | UI + logs |
| Confirm | Explicit user confirmation |
| Block | Hard stop (future) |

Activation is deferred to Phase 5+.

4. Dispatcher as the Only Enforcer

Important constraint:

UI never enforces
CCM never enforces
Dispatcher alone controls execution

This preserves Dropple's authority model.

Phase 4 Explicit Non-Goals (For Now)

Phase 4 planning does NOT include:

- Mandatory blocking
- Role-based permissions
- User accounts / auth
- Policy engines
- Automatic overrides

Phase 4 Exit Criteria (Planning)

Phase 4 planning is complete when:

- Dispatcher awareness model is defined
- Warning surfaces are mapped
- Enforcement tiers are documented
- No behavior is changed yet

Why This Sequencing Is Correct

You now have:

Identity (Phase 1)
Surface signals (Phase 2)
Semantic meaning (Phase 3 - locked)
System awareness (Phase 4 - planned)
Authority enforcement (future)

This is how operating systems evolve - not apps.
