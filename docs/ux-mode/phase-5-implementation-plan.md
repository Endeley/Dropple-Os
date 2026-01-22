# UX Mode - Phase 5

Implementation Plan (File-Level, No Code)

Status: PLANNING
Implements: Phase 4 (LOCKED)
Activates: Tier 0 (Observe) + Tier 1 (Warn) only

## 0. Phase 5 Non-Negotiables (Restated)

Before any file planning, the hard rules:

- No execution blocking
- No confirmation dialogs
- No dispatcher authority changes
- No CCM schema changes
- No mutation prevention
- No inference of profile

If a planned change could evolve into Tier 2+, it is out of scope.

## 1. High-Level Wiring Overview

Phase 5 introduces one directional data flow:

WorkspaceRoot
   |-- profile ("ux-validation")
        |--
     Dispatcher
        |--
   Awareness Layer (observe)
        |--
   Warning Emitters (post-exec only)

No component talks sideways.
No component talks upward.

## 2. File Touch Map (Authoritative)

### A. Workspace Authority Layer

WorkspaceRoot.jsx / tsx

Purpose

Already the single authority for profile
Phase 5 ensures profile is explicitly passed, not inferred

Allowed changes

- Pass profile into Dispatcher context / provider
- No defaults added
- No new profiles introduced

Forbidden

- Conditional logic on profile
- Enforcement decisions
- UI branching beyond existing Phase 2 work

### B. Dispatcher Core

DispatcherProvider.jsx / tsx

Purpose

Injection point for Dispatcher Awareness Layer

Allowed changes

- Introduce a pre-execution observation hook
- Introduce a post-execution signal emitter
- Accept profile as read-only context

Forbidden

- Wrapping execution in guards
- try/catch that alters outcomes
- Short-circuiting actions
- Returning altered results

Execution must remain structurally identical.

dispatcher/actions/*

Purpose

Source of action identity (actionType)

Allowed

- No changes required
- Optional: add static metadata maps outside action bodies

Forbidden

- Adding intent logic inside actions
- Annotating payloads
- Throwing warnings from action code

### C. Awareness and Classification (New, Isolated)

dispatcher/ux/

New directory (Phase 5)

This folder must not import UI or CCM code.

uxIntentMap.ts

Purpose

Lookup table: actionType -> intent
Derived from Phase 3 classification

Rules

- Static
- Exhaustive or default to hard-unsafe
- No runtime mutation

observeUXIntent.ts

Purpose

Pure function
Accepts { profile, actionType }
Returns { intent, severity }

Forbidden

- Side effects
- Logging
- Throwing

This file is pure semantics.

### D. Warning Emission Layer

dispatcher/ux/emitUXWarning.ts

Purpose

Translate observed intent -> warning signals
Post-execution only

Allowed

- Console warnings
- Structured event emission
- Session-scoped deduplication

Forbidden

- UI rendering
- Modals
- Confirmation flows
- Blocking calls

### E. UI Warning Surfaces (Passive Only)

WorkspaceShell.jsx / tsx

Purpose

Optional workspace-level banner host

Allowed

- Subscribe to warning signals
- Display dismissible, non-modal banner
- Session-scoped only

Forbidden

- Preventing interactions
- Hiding controls conditionally
- Forcing acknowledgment

Controls.jsx

Purpose

Already handles Phase 2 disable logic

Allowed

- Optional tooltip display after warnings
- Copy must match Phase 4 spec exactly

Forbidden

- New disabling logic
- Pre-emptive warnings

### F. Session and Audit (Optional but Recommended)

sessions/UXAuditLog.ts

Purpose

Append-only session log
Debug / QA oriented

Allowed

- Record { timestamp, actionType, intent }

Forbidden

- Persistence beyond session
- User-visible UI by default

## 3. Dependency Rules (Critical)

Phase 5 introduces one-way dependencies only:

Workspace -> Dispatcher -> UX Awareness -> Warnings -> UI

Forbidden dependency examples:

- UI -> Dispatcher enforcement
- Awareness -> CCM
- Warning layer -> action execution

## 4. CI and Guardrails (Phase 5-Specific)

Before merge, CI must assert:

- No throw added in Dispatcher paths
- No confirm() / modal usage
- No conditional return based on profile
- No mutation suppression
- No new permissions logic

If CI cannot detect this, Phase 5 is unsafe.

## 5. Rollback Strategy (Required)

Phase 5 must be revertible by:

- Removing dispatcher/ux/
- Removing warning subscriptions
- Leaving Dispatcher execution untouched

If rollback is not trivial, redesign required.

## 6. Phase 5 Exit Criteria (Implementation-Ready)

Phase 5 planning is complete when:

- All touched files are identified
- All new files are isolated
- No forbidden behavior is possible by design
- CI guardrails are defined
- Rollback is guaranteed

At this point, coding may begin.

## Canonical Phase 5 One-Liner

Phase 5 implements UX Mode awareness and warnings by wiring profile and intent observation through the Dispatcher without altering execution, authority, or mutability.
