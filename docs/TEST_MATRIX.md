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
npm run validate:all
npm run validate:app
npm run validate:release
```

Notes:
- `npm run validate:release` is the main release gate.
- `npm run validate:release` does not run every custom script in the repo; it runs the primary release path.
- `npm run validate:release` now includes a federation export-attestation gate that fails closed on missing or tampered attestation.
- Required PR check name: `PR Release Validation (validate:release)` from `.github/workflows/ci.yml`.
- `npm run validate:release` emits `.artifacts/release-trust.json` with canonical trust checks and a report hash.
- PR CI uploads release trust artifacts and enforces a blocking `release:trust:diff` step for trust drift protection.
- Baseline diff enforcement is date-gated via `RELEASE_TRUST_BASELINE_REQUIRED_AFTER` (currently `2026-07-01T00:00:00.000Z`).
- `release:trust:diff` supports semantic strict mode via `RELEASE_TRUST_DIFF_STRICT=true` (default `false`).
- PR CI publishes a semantic release-trust summary to `GITHUB_STEP_SUMMARY` for reviewer-readable governance outcomes.
- PR CI also publishes/updates a sticky release-trust PR comment (best-effort) for thread-level reviewer visibility.

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
