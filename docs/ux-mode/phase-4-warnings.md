# UX Mode - Phase 4

UX Warning Language and Surfaces Specification (Planning Only)

Status: PLANNING
Depends on: Phase 3 (LOCKED), Phase 4 Dispatcher Awareness (PLANNED)
Scope: Language, tone, and surfaces - no enforcement

## 0. Design Philosophy (Critical)

UX warnings must inform, not intimidate.

This is not:

- An error system
- A permission system
- A compliance system

It is:

- A situational awareness system
- A professional signal
- A trust-preserving guardrail

## 1. Warning Severity Levels (Semantic, Not Technical)

Phase 4 defines three UX warning levels, mapped directly from intent.

| UX Intent | Warning Level | Meaning |
| --- | --- | --- |
| safe | none | No warning |
| soft-unsafe | notice | Informational |
| hard-unsafe | warning | Strong signal, no block |

No "error" level exists in Phase 4.

## 2. Canonical Warning Language (Locked Copy)

### 2.1 Soft-Unsafe - Notice

Tone: Calm, informational
Purpose: Awareness without friction

Canonical copy:

"This action modifies workspace state while in UX Validation Mode."

Optional suffix (dev-facing only):

"Classification: Soft-Unsafe"

### 2.2 Hard-Unsafe - Warning

Tone: Serious, professional, non-judgmental
Purpose: Clear signal of intent mismatch

Canonical copy:

"This action performs a structural change while in UX Validation Mode."

Optional suffix:

"Classification: Hard-Unsafe"

### 2.3 Forbidden Language (Never Use)

- "You are not allowed to..."
- "Permission denied"
- "Action blocked"
- "Violation"
- "Unauthorized"

These are Phase 5+ terms only.

## 3. UX Surfaces (Where Warnings May Appear)

Phase 4 defines allowed surfaces, not required ones.

### 3.1 Developer Console (Primary)

Always available
Zero UX friction
First surface to activate

Example:

[UX MODE] Hard-Unsafe action executed: NodeDelete

### 3.2 Workspace Banner (Secondary, Non-Modal)

Appears at workspace root
Non-blocking
Dismissible
Session-scoped

Example:

WARNING: Structural changes detected in UX Validation Mode.

Rules:

- Never modal
- Never sticky across reloads
- Never blocks input

### 3.3 Action-Origin Tooltip (Optional, Contextual)

Appears near the triggering control
Reinforces Phase 2 disabled controls logic
May appear after action execution

Example:

"This action is considered unsafe for UX validation."

### 3.4 Session Log / Audit Trail (Passive)

Stored per session
Not user-facing by default
Useful for QA, review, replay

## 4. Surface Activation Matrix

| Surface | Soft-Unsafe | Hard-Unsafe |
| --- | --- | --- |
| Console | Yes | Yes |
| Workspace banner | No | Yes |
| Tooltip | Optional | Optional |
| Session log | Yes | Yes |

No surface is mandatory except console logs.

## 5. Timing Rules (Important)

Warnings must be:

- Post-execution (never pre-blocking)
- Asynchronous
- Non-interrupting

Sequence:

Action executes -> Dispatcher observes -> Warning emitted

Never:

Warning -> User decision -> Execution

That belongs to later phases.

## 6. Visual Language Guidelines (Non-Visual Spec)

Even without UI implementation, the tone is locked:

Color: Neutral amber / informational (not red)
Iconography: Caution, not error
Motion: None required
Sound: Never

## 7. Developer Experience Rules

Warnings must be deduplicated
Repeated actions should collapse into one signal
Noise is worse than silence

Example:

One banner per session, not per action.

## 8. Explicit Non-Goals (Locked)

Phase 4 warnings must NOT:

- Require user confirmation
- Add buttons like "Proceed anyway"
- Persist across sessions
- Be configurable per user
- Be suppressible per action (yet)

## 9. Phase 4 UX Warning Exit Criteria (Planning)

This planning step is complete when:

- Warning language is finalized
- Severity levels are mapped
- Allowed surfaces are defined
- Timing rules are locked
- No enforcement slipped in

## 10. Canonical One-Liner

UX warnings in Phase 4 provide post-execution visibility into unsafe actions in UX Validation Mode without interrupting flow or altering system behavior.

## State Check

Phase 3: LOCKED
Phase 4 Awareness: PLANNED
Phase 4 Warnings: PLANNED
Enforcement: Not yet
