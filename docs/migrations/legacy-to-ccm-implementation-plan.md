# Legacy → CCM Migration
Phased Implementation Plan (No Code)

Status: Planning-only  
Execution: ❌ Not started  
Design dependencies: ✅ Complete  
Risk tolerance: Minimal

## 0. Guiding Principle (Read This First)

Migration is not a feature. It is infrastructure. Infrastructure is introduced
slowly, behind guards, and with exit ramps.

This plan assumes:

- Legacy and CCM will coexist for a long time
- Conversion is opt-in
- Rejection is a valid outcome
- Trust > coverage

## Phase 1 — Visibility Without Behavior Change

Goal

Make legacy vs CCM status explicit everywhere, without changing runtime
behavior.

What is allowed

- Add flags
- Add metadata
- Add docs
- Add logging
- Add UI labels (read-only)

What is forbidden

- No conversion
- No new pipelines
- No template rewriting
- No auto-detection

Deliverables

- Legacy templates explicitly marked:
  - legacyOnly: true
- UI badges:
  - "Legacy Template"
  - "CCM Template"
- Marketplace hides legacy templates by default (read-only)

Exit criteria

- Every template is visibly classified
- No ambiguity about template type
- No runtime regressions

## Phase 2 — Dry-Run Conversion (Audit Only)

Goal

Allow the system to analyze legacy templates and explain outcomes — without
producing CCM artifacts.

What is allowed

- Implement canConvert
- Generate migration audit reports
- Produce rejection reasons
- Store reports (file or DB)

What is forbidden

- No artifact creation
- No CCM writes
- No legacy mutation

Deliverables

- Audit reports for selected templates
- Human-readable explanations
- Stats:
  - % convertible
  - % rejected
  - common blockers

Exit criteria

- Reports are understandable by non-engineers
- No false positives
- Rejection reasons align with docs

## Phase 3 — Controlled Conversion (Private Only)

Goal

Enable private, non-marketplace CCM conversion for trusted users.

What is allowed

- Full convert() implementation
- Validator-gated artifact generation
- Private CCM storage
- Author approval only

What is forbidden

- Marketplace exposure
- Auto-publishing
- AI-only approval

Deliverables

- CCM artifacts generated on demand
- Successful audit reports (outcome: converted)
- Private workspace usage

Exit criteria

- Converted templates behave deterministically
- No legacy data is mutated
- Rollback is trivial (stop using artifact)

## Phase 4 — Marketplace Review & Approval

Goal

Introduce human-reviewed marketplace publishing.

What is allowed

- Reviewer role
- Approval UI
- Marketplace ingestion
- Eligibility enforcement

What is forbidden

- Auto-publishing
- Bypassing audit trail
- Ignoring warnings

Deliverables

- Reviewer dashboard
- Approval metadata
- Published CCM templates

Exit criteria

- Buyers can trust CCM templates
- Audit trail is complete
- No legacy leakage

## Phase 5 — AI-Assisted Migration (Optional, Later)

Goal

Let AI assist within strict guardrails.

What is allowed

- AI-generated candidate artifacts
- AI-generated audit drafts
- Human approval required

What is forbidden

- AI auto-approval
- AI auto-publishing
- AI bypassing validator

Deliverables

- AI suggestions
- Human-in-the-loop flows
- Clear provenance labels

Exit criteria

- AI output indistinguishable from human at runtime
- Approval discipline maintained

## Phase 6 — Deprecation (Far Future)

Goal

Reduce reliance on legacy templates without deleting history.

What is allowed

- Default CCM-first UX
- Soft warnings on legacy usage
- Incentives to migrate

What is forbidden

- Forced deletion
- Breaking old projects
- Silent upgrades

Deliverables

- Legacy usage metrics
- Deprecation timeline
- Archived legacy support

## Safety Valves (Always On)

At every phase:

- legacyOnly: true remains authoritative
- CCM validator is a hard gate
- Audit reports are mandatory
- CI guards stay enabled
- Rollback = stop invoking the new path

## Why This Plan Works for You (Specifically)

- You can stop after any phase
- No phase forces the next
- No data is destroyed
- No assumptions are hidden
- Each step is testable in isolation

This is how large systems evolve without resets.

## Final Lock

Implementation does not begin until Phase 1 is fully complete.

You are currently before Phase 1 — which is exactly where you should be.
