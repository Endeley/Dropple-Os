# UX Mode - Phase 6

Leakage and Risk Audit

Scope: Architectural + behavioral
Goal: Ensure Confirm is pause-with-consent, not enforcement

## 1. Critical Leakage Vector: Dispatcher Pause Semantics

Risk

Pause quietly becomes:

- A soft block
- A timeout-based cancel
- A queued or deferred execution
- A retry loop

Any of these change execution semantics.

Guardrail

Dispatcher may pause only while awaiting an explicit user response.

Audit Checks

Pause state:

- Is synchronous from Dispatcher’s perspective
- Has a single resume path (Confirm)
- Has a single abort path (Cancel)

No timers
No retries
No queues

Safe

Pause waits for user.

Unsafe

Pause auto-cancels after delay.

## 2. Leakage Vector: UI Becoming the Authority

Risk

UI logic decides:

- Whether confirmation is required
- Whether execution proceeds
- Whether cancellation is allowed

That creates dual authority.

Guardrail

Dispatcher decides; UI renders.

Audit Checks

- UI receives a "confirm required" signal
- UI does not infer intent
- UI does not infer tier
- UI does not call execution directly

Safe

UI renders modal only.

Unsafe

UI conditionally executes actions.

## 3. Leakage Vector: Confirmation Copy Drift

Risk

Language becomes:

- Fear-based
- Moralizing
- Legalistic
- Over-warning

This nudges Confirm into policy enforcement.

Guardrail

Canonical copy is immutable.

Audit Checks

- Title, body, buttons match spec exactly
- No extra paragraphs
- No icons implying danger
- No red/error styling

Safe

Declarative, neutral.

Unsafe

"This may irreversibly damage your workspace"

## 4. Leakage Vector: Confirmation Memory Escalation

Risk

Session-scoped memory evolves into:

- Persistent permission
- User trust score
- Action whitelist
- Role-based bypass

That is authorization, not confirmation.

Guardrail

Confirmation memory is fatigue reduction only.

Audit Checks

Memory:

- Per action type
- Per session
- Cleared on reload

Memory never:

- Persists
- Escalates
- Influences other actions

Safe

"NodeDelete confirmed this session"

Unsafe

"User is trusted for deletes"

## 5. Leakage Vector: Cancel Semantics

Risk

Cancel becomes:

- Treated as an error
- Logged as a violation
- Used to escalate enforcement
- Retried automatically

That punishes caution.

Guardrail

Cancel is a neutral outcome.

Audit Checks

Cancel:

- Produces no side effects
- Does not emit errors
- Does not trigger warnings

Optional logging is informational only.

Safe

Silent abort.

Unsafe

Error toast on cancel.

## 6. Leakage Vector: Confirm Outside UX Mode

Risk

Confirm dialogs appear:

- In design mode
- In production flows
- In non-UX profiles

This violates the profile contract.

Guardrail

Confirm exists only at the intersection of:
ux-validation + hard-unsafe + Tier 2.

Audit Checks

Triple-gate enforcement

- No feature flags substituting profile
- No environment-based shortcuts

Safe

Confirm never appears outside UX Mode.

Unsafe

Confirm in design profile "just in case"

## 7. Leakage Vector: Confirm for Soft-Unsafe Actions

Risk

Soft-unsafe actions begin to request confirmation "for safety".

This erodes the intent taxonomy.

Guardrail

Only Hard-Unsafe actions may trigger Confirm.

Audit Checks

- Intent lookup is authoritative
- No per-action overrides
- No UI-based confirmation triggers

Safe

Soft-unsafe executes freely.

Unsafe

"Confirm layout change?"

## 8. Leakage Vector: Confirm as a Path to Block

Risk

Cancel is treated as:

- Implicit denial
- Evidence for blocking later
- Reason to escalate Tier automatically

This collapses Tier separation.

Guardrail

No tier auto-escalation. Ever.

Audit Checks

- Cancel does not alter tier
- Cancel does not affect future sessions
- Tier remains fixed by configuration only

Safe

Tier remains Tier 2.

Unsafe

"After 3 cancels -> block"

## 9. CI Guardrail Gaps (Phase 6-Specific)

New Required CI Assertions (Planning)

Phase 6 CI must fail if:

- Confirm modals exist outside UX Mode
- Confirm exists for soft-unsafe actions
- Dispatcher abort path mutates state
- Confirmation memory persists beyond session
- Tier auto-escalation logic exists

If CI cannot detect these, Phase 6 is unsafe to ship.

## 10. Red Flag Summary (Immediate Rollback Triggers)

If any of the following appear, Phase 6 must halt:

- UI decides whether to execute
- Confirm copy deviates
- Cancel treated as error
- Confirm appears outside UX Mode
- Confirmation remembered across sessions
- Dispatcher blocks without user choice

## 11. Audit Verdict

Phase 6 design is safe - with conditions.

It remains:

- Consent-based
- Dispatcher-authoritative
- Reversible
- Non-punitive

Provided that CI guardrails are extended and the triple-gate rule is enforced.
