# UX Mode - Phase 5

Leakage and Risk Audit

Scope: File-level and architectural
Goal: Prevent silent enforcement, authority drift, or UX creep

## 1. Critical Leakage Vector: Dispatcher Observation Hooks

Risk

Observation hooks subtly become pre-execution guards.

Common failure patterns:

- if (profile === "ux-validation") { ... } inside execution path
- try/catch added "just for logging"
- returning early on classification errors

Guardrail

Hard rule:

Observation must be side-channel only.

Audit Checks

Dispatcher execution path must remain byte-for-byte equivalent

Observation runs:

- Either before execution with zero branching
- Or after execution only

No conditional return based on:

- profile
- intent
- severity

Safe

Observation remains outside the execution path.

Unsafe

Any if (uxMode) inside dispatcher execution

## 2. Leakage Vector: Intent Classification Location

Risk

Intent logic sneaks into:

- Action creators
- Payloads
- CCM validators
- UI components

This creates distributed authority.

Guardrail

Single source of intent truth:

dispatcher/ux/uxIntentMap.ts

Audit Checks

- No action file references intent
- No payload contains intent
- No UI infers intent independently
- Default intent = hard-unsafe if unknown

Safe

Intent is looked up, never declared.

Unsafe

Intent added to action payloads.

## 3. Leakage Vector: Warning Surfaces Becoming Enforcement

Risk

Warnings drift into:

- Modals
- Required dismissals
- "Proceed anyway" buttons
- Blocking overlays

This is Tier 2 behavior.

Guardrail

Phase 5 UI rule:

Warnings must be ignorable by default.

Audit Checks

- No modal components
- No promise-based UX flows
- No UI state that pauses execution

Banners are:

- Dismissible
- Session-scoped
- Non-sticky

Safe

Passive banner.

Unsafe

Dialog requiring acknowledgment.

## 4. Leakage Vector: Session Logs Becoming Policy State

Risk

Audit logs accidentally become:

- Persistent
- User-visible
- Input into future decisions

That creates historical enforcement.

Guardrail

Session logs are write-only.

Audit Checks

Logs:

- Append-only
- Memory-scoped
- Destroyed on session end

Logs are:

- Not read by Dispatcher
- Not read by UI for decisions
- Not used to escalate severity

Safe

Logs for QA.

Unsafe

Logs influencing runtime behavior.

## 5. Leakage Vector: Deduplication Logic

Risk

Deduplication logic accidentally introduces:

- Counting
- Thresholds
- "After 3 warnings, do X"

This is implicit escalation.

Guardrail

Deduplication is purely cosmetic.

Audit Checks

Deduplication:

- Collapses identical warnings
- Does not count frequency
- Does not track time

No counters
No timers
No heuristics

Safe

Show once per session.

Unsafe

Show after N times.

## 6. Leakage Vector: CI Guardrails Too Weak

Risk

CI only checks behavior, not intent drift.

Guardrail

CI must fail on patterns, not outcomes.

Required CI Rules

- No confirm() usage
- No modal imports in UX warning paths
- No throw in dispatcher awareness files
- No return conditioned on profile or intent
- No mutation suppression keywords (deny, block, prevent)

If CI cannot detect these, Phase 5 is unsafe.

## 7. Leakage Vector: Developer Helpfulness

Risk

A well-meaning dev adds:

- Extra tooltip copy
- Stronger language
- Convenience confirmation

This breaks phase discipline.

Guardrail

Canonical copy is locked.

Audit Checks

- Warning copy matches Phase 4 spec exactly
- No additional adjectives
- No moral language
- No urgency cues

Safe

"This action performs a structural change..."

Unsafe

"This could seriously damage your workspace!"

## 8. Authority Drift Check (Most Important)

Final authority test:

Can any component besides Dispatcher stop an action?

If yes, Phase 5 failed.

Audit Verification

- UI never blocks
- CCM never blocks
- Awareness layer never blocks
- Dispatcher never blocks (yet)

Only Phase 6+ may change this.

## 9. Red Flag Summary (Instant Rollback Triggers)

If any of the following appear, rollback immediately:

- Confirmation dialogs
- Execution delays
- Conditional returns in Dispatcher
- Intent stored in payloads
- Logs used for decisions
- UI preventing interaction
- CI allowing Tier 2 patterns

## 10. Audit Verdict

Phase 5 design is clean.
No inherent leakage detected if guardrails are enforced.

You are safe to proceed only if:

- CI rules are added first
- Awareness code is isolated
- Reviewers know Phase 6+ is forbidden
