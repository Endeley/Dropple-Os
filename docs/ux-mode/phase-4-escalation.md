# UX Mode - Phase 4

Enforcement Tier Escalation Rules (Planning Only)

Status: PLANNING
Depends on:

- Phase 3 (Semantic intent - LOCKED)
- Phase 4 Dispatcher Awareness (PLANNED)
- Phase 4 UX Warnings (PLANNED)

Important:

No tier is active yet.
This document defines how escalation would work, not when it happens.

## 0. Core Escalation Principle (Non-Negotiable)

Escalation is monotonic, explicit, and reversible only by phase, never implicitly.

- No automatic promotion
- No hidden thresholds
- No silent behavior changes
- No per-user overrides

Each tier must be explicitly activated by a future phase.

## 1. Enforcement Tiers (Canonical Ladder)

Phase 4 defines four tiers, but activates Tier 0 only.

| Tier | Name | Status |
| --- | --- | --- |
| Tier 0 | Observe | Allowed (Phase 4) |
| Tier 1 | Warn | Planned |
| Tier 2 | Confirm | Planned |
| Tier 3 | Block | Planned |

## 2. Tier 0 - Observe (Active in Phase 4)

Purpose: System awareness only

Behavior

- Action executes normally
- Dispatcher observes profile + intent
- Signals emitted (logs, warnings)

Guarantees

- Zero UX friction
- Zero execution change
- Fully reversible

Tier 0 is pure telemetry.

## 3. Tier 1 - Warn (Planned)

Purpose: Human awareness

Behavior

- Action executes
- UX warnings appear (as defined previously)
- No confirmation required

Constraints

- No modals
- No input blocking
- No action delays

Tier 1 corresponds exactly to Phase 4 UX Warnings, but is still inactive.

## 4. Tier 2 - Confirm (Planned)

Purpose: Intent affirmation

Behavior

- Action is intercepted before execution
- User must explicitly confirm
- Confirmation is session-scoped

Key Rules

- Applies only to Hard-Unsafe actions
- Confirmation copy is declarative, not threatening
- One confirmation per action type per session

Example (conceptual):

"This action performs a structural change in UX Validation Mode. Continue?"

Important

Tier 2 is the first tier that alters execution flow.
It cannot exist without:

- Phase 3 semantics
- Phase 4 awareness
- Phase 4 warnings

## 5. Tier 3 - Block (Planned)

Purpose: Hard safety boundary

Behavior

- Action is rejected
- Dispatcher returns structured refusal
- UI may explain why, but cannot override

Constraints

- No silent failures
- No fallback execution
- No partial mutations

Copy (Locked Tone)

"This action is not permitted in UX Validation Mode."

Tier 3 is authoritative enforcement and must remain rare.

## 6. Escalation Eligibility Rules

Escalation is based on three inputs only:

- Workspace profile (ux-validation)
- Action intent (safe | soft-unsafe | hard-unsafe)
- Active enforcement tier

Never based on:

- User role
- Time
- Frequency
- Environment
- Heuristics
- AI judgment

## 7. Escalation Matrix (Canonical)

| Intent | Tier 0 | Tier 1 | Tier 2 | Tier 3 |
| --- | --- | --- | --- | --- |
| safe | Execute | Execute | Execute | Execute |
| soft-unsafe | Execute | Warn | Execute | Execute |
| hard-unsafe | Execute | Warn | Confirm | Block |

This matrix is immutable once enforcement begins.

## 8. Rollback and Safety Guarantees

- Any tier can be globally disabled
- Tier downgrade must restore original behavior
- No tier may persist state across sessions unless explicitly designed

If Tier 2 breaks UX testing, revert to Tier 1.
If Tier 3 blocks workflows, revert to Tier 2.

## 9. Explicit Prohibitions (Critical)

No tier may:

- Mutate CCM schemas
- Rewrite action payloads
- Introduce permissions
- Depend on UI compliance
- Be silently enabled

If any of these occur, enforcement is invalid.

## 10. Phase 4 Exit Criteria (Final)

Phase 4 planning is complete when:

- Escalation tiers are defined
- Tier behaviors are explicit
- Escalation matrix is locked
- No tier is activated beyond Observe
- Rollback guarantees exist

At this point, Phase 4 as a whole may be locked.

## Canonical One-Liner (Escalation)

Enforcement in UX Mode progresses through explicit tiers - Observe, Warn, Confirm, Block - each adding controlled friction without compromising authority or reversibility.

## Current System State

Phase 3: LOCKED
Phase 4 Awareness: PLANNED
Phase 4 Warnings: PLANNED
Phase 4 Escalation: PLANNED
Enforcement Active: Tier 0 only

## Final Decision Point

You now have a complete, coherent Phase 4 plan.
