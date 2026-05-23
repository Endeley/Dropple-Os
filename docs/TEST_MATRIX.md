# Dropple Test Matrix

Status: Stable command reference  
Authority level: Informational (subordinate to `docs/LAW.md`)  
Purpose: Provide one clean copy-paste reference for validation, architecture, runtime, engine, and UI-facing test scripts.

---

## Purpose

This document lists the repo scripts that are relevant to:

- governance checks
- architecture checks
- determinism checks
- aggregated test runs
- focused engine/runtime test runs
- Playwright route smoke

Use this file as the canonical command reference when validating Dropple changes locally.

---

## List All Scripts

```bash
npm run
```

---

## Governance / Architecture

```bash
npm run arch
npm run enforce:laws
npm run architecture:ci
npm run architecture:drift
npm run architecture:guard
npm run architecture:monitor
npm run architecture:phase
npm run architecture:radar
npm run architecture:score
npm run architecture:transition:audit
npm run implementation:navigator
npm run migration:legacy-scan
```

Notes:
- `npm run arch` and `npm run enforce:laws` both run the constitutional law audit.
- `npm run implementation:navigator` reports roadmap phase state and constitutional risks.
- `npm run migration:legacy-scan` reports remaining legacy mode references during Phase 2 migration.

---

## Validation / Release Gates

```bash
npm run determinism
npm run ci:determinism
npm run template:verify-all
npm run validate:pr:fast
npm run ci:fast
npm run ci:release-trust
npm run ci:release-trust:locked
npm run ci:full
npm run preflight
npm run validate:all
npm run validate:app
npm run validate:release
npm run release:trust:baseline:ensure
npm run release:trust:clean-generated
```

Notes:
- `npm run validate:pr:fast` is the lightweight PR gate for rapid iteration (`test:architecture` + `test:release:operator-surfaces`).
- `npm run ci:fast` is the CI alias for `validate:pr:fast`.
- `npm run ci:release-trust` runs the focused release-trust lane (attestation tests, operator-surface tests, report, summary).
- `npm run ci:release-trust:locked` runs the focused release-trust lane with enforced baseline cutoff policy.
- `npm run ci:full` runs the full release lane (`validate:release`).
- `npm run preflight` is the daily contributor confidence flow: clean generated trust noise, ensure baseline presence, then run the fast PR gate.
- `npm run release:trust:baseline:ensure` bootstraps missing release-trust baseline artifacts from current artifacts, fails open before cutoff, and fails closed after `RELEASE_TRUST_BASELINE_REQUIRED_AFTER`.
- `npm run release:trust:clean-generated` removes local generated trust noise directories (`.artifacts`, `.tmp`, `var`) without touching tracked source files.
- `npm run validate:release` is the main release gate.
- `npm run validate:release` does not run every custom script in the repo; it runs the primary release path.
- `npm run validate:release` now includes a federation export-attestation gate that fails closed on missing or tampered attestation.
- Required PR check name: `PR Release Validation (validate:release)` from `.github/workflows/ci.yml`.
- `npm run validate:release` emits `.artifacts/release-trust.json` with canonical trust checks and a report hash.
- `npm run release:trust:ledger` appends `.artifacts/release-trust-ledger.jsonl` with tamper-evident chained entries.
- `npm run release:trust:ledger:verify` fails closed if any historical ledger entry hash or chain pointer is tampered.
- `npm run release:federation:lineage` emits `.artifacts/federation-audit-lineage.json` and fails closed when federation lifecycle invariants regress.
- `npm run release:federation:lineage:ledger` appends `.artifacts/federation-audit-lineage-ledger.jsonl` as a tamper-evident federation lineage chain.
- `npm run release:federation:lineage:ledger:verify` fails closed on lineage-ledger chain/hash tampering.
- `npm run test:federation:release` is the focused federation release gate (tamper, stale event rejection, replay equivalence, ordering closure).
- PR CI uploads release trust artifacts and enforces a blocking `release:trust:diff` step for trust drift protection.
- PR and main CI now upload both `release-trust.json` and `release-trust-ledger.jsonl` artifacts.
- PR and main CI also upload `federation-audit-lineage.json` for federation governance lineage visibility.
- PR and main CI now upload `federation-audit-lineage-ledger.jsonl` and seed PR lineage-ledger continuity from the latest successful `main`.
- Baseline diff enforcement is date-gated via `RELEASE_TRUST_BASELINE_REQUIRED_AFTER` (currently `2026-07-01T00:00:00.000Z`).
- CI cutoff policy authority is workflow-global env in `.github/workflows/ci.yml` (single source of truth).
- Enforced policy commands:
- `npm run release:trust:diff:enforced`
- `npm run release:trust:summary:enforced`
- `npm run release:trust:pr-comment:enforced`
- `release:trust:diff` supports semantic strict mode via `RELEASE_TRUST_DIFF_STRICT=true` (default `false`).
- PR CI publishes a semantic release-trust summary to `GITHUB_STEP_SUMMARY` for reviewer-readable governance outcomes.
- PR CI also publishes/updates a sticky release-trust PR comment (best-effort) for thread-level reviewer visibility.
- Triage runbook: `docs/RELEASE_TRUST_TRIAGE_RUNBOOK.md`.
- Contributor playbook: `docs/CONTRIBUTOR_PREFLIGHT_PLAYBOOK.md`.

---

## Aggregated Tests

```bash
npm run test:all
npm run test:core:all
npm run test:engine:all
npm run test:runtime:all
npm run test:kernel
npm run test:architecture
npm run test:system:all
npm run test:system:app
npm run test:system:runtime
npm run test:routes:smoke
npm run ui:interactions:test
```

Notes:
- `npm run test:routes:smoke` runs the Playwright E2E route suite.
- `npm run ui:interactions:test` is **not** Playwright right now.
- `npm run ui:interactions:test` runs `scripts/architectureTransitionAudit.mjs`.

---

## Focused Engine / Runtime Tests

```bash
npm run engine:test
npm run engine:shot:test
npm run engine:dispatcher:test
npm run engine:projection:test
npm run engine:timeline:test
npm run engine:timeline:controller:test
npm run engine:timeline:controller:diff:test
npm run engine:timeline:dag:test
npm run engine:timeline:diff:test
npm run engine:timeline:evaluate:test
npm run engine:timeline:history:test
npm run engine:timeline:label:test
npm run engine:track:test
npm run engine:track:blend:test
npm run engine:track:group:test
npm run engine:track:lock:test
npm run engine:export:stability:test
npm run runtime:map:test
npm run runtime:replay:test
npm run runtime:resize:session:test
npm run runtime:statehash:test
```

---

## Build / App

```bash
npm run dev
npm run dev:stable
npm run build
npm run build:smoke
npm run build:e2e
npm run start
npm run start:e2e
npm run lint
npm run create:workspace
```

---

## Recommended Phase 2 Checkpoint

Use this set when validating the current overlay migration work:

```bash
npm run arch
npm run implementation:navigator
npm run test:runtime:all
npm run test:routes:smoke
npm run migration:legacy-scan
```

---

## Recommended Release Checkpoint

Use this set before cutting a broader release candidate:

```bash
npm run validate:release
```

Optional deeper confidence:

```bash
npx playwright test tests/e2e --repeat-each=3
```

---

## Final Principle

Use the smallest command surface that proves the change you made.

- local slice change: run the focused proof first
- subsystem change: run the aggregated subsystem tests
- architectural change: run governance and architecture checks
- release candidate: run the release gate
