# Dropple Test Matrix

Status: Stable command reference  
Authority level: Informational (subordinate to `docs/LAW.md`)  
Purpose: Provide one current, copy-paste-safe map of what to run based on the kind of work you are doing.

---

## Purpose

This file is not just a flat script dump.

Use it to answer:

- what should I run while iterating locally?
- what should I run after changing UI or creator flows?
- what should I run after touching kernel/runtime behavior?
- what should I run before pushing?
- what should I run before a release or constitutional freeze?

If you only need the full raw list, run:

```bash
npm run
```

---

## Important Corrections

These are the most common misreadings of the repo scripts:

- `npm run arch` and `npm run enforce:laws` currently do the same thing.
- `npm run test:routes:smoke` is not just route smoke anymore.
  It runs the Playwright E2E suite in `tests/e2e` after `build:e2e`.
- `npm run ui:interactions:test` is **not** Playwright.
  It currently runs `scripts/architectureTransitionAudit.mjs`.
- `npm run validate:app` is the app confidence gate.
  Today that means `build:smoke` + full Playwright E2E.
- `npm run test:system:app` is just an alias for `npm run validate:app`.
- `npm run test:all` does **not** run Playwright.
  It runs core + kernel + architecture + `ui:interactions:test`.
- `npm run validate:release` is the broad release lane.
  It is much larger than “run all tests”.

---

## When To Run What

### 1. While Making Small UI or Product-Flow Changes

Use this when working on:

- First World presentation
- Creative Initiation / empty-world flow
- workspace shell behavior
- inspector / dock / toolbar behavior
- verification translation

Start with the smallest proof:

```bash
npm run test:routes:smoke
```

If the change is in workspace interactions:

```bash
npx playwright test tests/e2e/workspace-interactions.spec.js
```

If the change is in a focused flow:

```bash
npx playwright test tests/e2e/uiux-empty-world.spec.js
npx playwright test tests/e2e/uiux-project-emergence.spec.js
npx playwright test tests/e2e/uiux-template-generation.spec.js
npx playwright test tests/e2e/graphic-empty-world.spec.js
```

Run these before you widen scope:

```bash
npm run build:smoke
npm run test:routes:smoke
```

---

### 2. While Repairing Verification

Use this when tests are red and you need to classify failures into:

- outdated verification contract
- real regression
- incorrect test assumption

Primary command:

```bash
npm run test:routes:smoke
```

Useful targeted reruns:

```bash
npx playwright test tests/e2e/workspace-routes.smoke.spec.js
npx playwright test tests/e2e/workspace-workflows.smoke.spec.js
npx playwright test tests/e2e/workspace-interactions.spec.js
```

Rule:

- if product truth changed, fix tests
- if implementation broke, fix code
- if navigation assumptions are stale, fix test flow

---

### 3. While Working on Kernel / Runtime / Dispatcher Truth

Use this when touching:

- dispatcher
- reducers
- replay
- state ownership
- projection truth
- runtime geometry / resize sessions

Focused runtime proofs:

```bash
npm run runtime:map:test
npm run runtime:replay:test
npm run runtime:statehash:test
npm run runtime:resize:session:test
```

Kernel-level confidence:

```bash
npm run test:kernel
npm run test:runtime:all
```

If the work changes execution truth broadly:

```bash
npm run test:core:all
npm run determinism
```

---

### 4. While Working on Engine / Timeline / Shot / Track Logic

Use this when touching:

- evaluation
- shots
- tracks
- timeline DAG / labeling / diff
- export stability

Focused engine proofs:

```bash
npm run engine:test
npm run engine:shot:test
npm run engine:track:test
npm run engine:timeline:test
npm run engine:dispatcher:test
npm run engine:projection:test
npm run engine:timeline:evaluate:test
npm run engine:timeline:history:test
npm run engine:timeline:controller:test
npm run engine:timeline:controller:diff:test
npm run engine:timeline:diff:test
npm run engine:export:stability:test
npm run engine:track:lock:test
npm run engine:track:blend:test
npm run engine:track:group:test
npm run engine:timeline:dag:test
npm run engine:timeline:label:test
```

Aggregated engine confidence:

```bash
npm run test:engine:all
```

---

### 5. While Working on Architecture, Laws, or Governance Surfaces

Use this when touching:

- constitutional law
- architecture guardrails
- roadmap / implementation navigation
- release operator surfaces
- contributor or CI governance docs

Primary commands:

```bash
npm run arch
npm run test:architecture
npm run test:release:operator-surfaces
```

Deeper architecture tools:

```bash
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

Fast PR-level governance gate:

```bash
npm run validate:pr:fast
```

---

### 6. While Working on App-Level Confidence

Use this when the work crosses product behavior, routing, buildability, or E2E interaction:

```bash
npm run validate:app
```

What that currently means:

```bash
npm run build:smoke
npm run test:routes:smoke
```

Equivalent aliases:

```bash
npm run test:system:app
npm run test:system:all
```

Notes:

- `test:system:runtime` is Node-based system tests.
- `test:system:app` is build + Playwright.
- `test:system:all` runs both.

---

### 7. Before Pushing a Normal Change

Use the smallest command set that matches your change.

Suggested default for most product / UI work:

```bash
npm run test:architecture
npm run test:release:operator-surfaces
npm run validate:app
```

Suggested default for kernel/runtime work:

```bash
npm run test:kernel
npm run test:runtime:all
npm run determinism
npm run test:architecture
```

Suggested default for mixed app + kernel work:

```bash
npm run test:all
npm run test:system:all
npm run determinism
```

---

### 8. Before a Release Candidate or Freeze

Full release lane:

```bash
npm run validate:release
```

This is the broadest standard gate and includes:

- `validate:all`
- `performance:determinism`
- `template:verify-all`
- `test:federation:release`
- `test:release:attestation`
- release trust reporting
- federation lineage
- blueprint lineage + ledger verification

If you only need the release-trust lane:

```bash
npm run ci:release-trust
```

If you need enforced baseline policy:

```bash
npm run ci:release-trust:locked
```

---

## Script Groups

### Governance / Architecture

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
npm run implementation:navigator:v2
npm run implementation:navigator:project
npm run implementation:navigator:ui-workspaces
npm run implementation:navigator:post-u13
npm run migration:legacy-scan
npm run template:registry:migrate
```

### Engine / Runtime Focus

```bash
npm run engine:test
npm run engine:shot:test
npm run engine:track:test
npm run engine:timeline:test
npm run engine:dispatcher:test
npm run engine:projection:test
npm run engine:timeline:evaluate:test
npm run engine:timeline:history:test
npm run engine:timeline:controller:test
npm run engine:timeline:controller:diff:test
npm run engine:timeline:diff:test
npm run engine:export:stability:test
npm run engine:track:lock:test
npm run engine:track:blend:test
npm run engine:track:group:test
npm run engine:timeline:dag:test
npm run engine:timeline:label:test
npm run runtime:map:test
npm run runtime:replay:test
npm run runtime:statehash:test
npm run runtime:resize:session:test
```

### Aggregated Test and Validation Commands

```bash
npm run test:engine:all
npm run test:runtime:all
npm run test:core:all
npm run test:kernel
npm run test:architecture
npm run test:all
npm run test:system:runtime
npm run test:system:app
npm run test:system:all
npm run test:routes:smoke
npm run validate:app
npm run validate:all
npm run validate:release
```

### Release Trust / CI / Determinism

```bash
npm run determinism
npm run performance:determinism
npm run ci:determinism
npm run template:verify-all
npm run test:federation:release
npm run test:release:attestation
npm run test:release:operator-surfaces
npm run release:trust:report
npm run release:trust:summary
npm run release:trust:diff
npm run release:trust:baseline:ensure
npm run release:trust:baseline:capture
npm run release:trust:clean-generated
npm run release:trust:ledger
npm run release:trust:ledger:verify
npm run release:federation:lineage
npm run release:federation:lineage:ledger
npm run release:federation:lineage:ledger:verify
npm run release:blueprint:lineage
npm run release:blueprint:lineage:ledger
npm run release:blueprint:lineage:ledger:verify
npm run validate:pr:fast
npm run ci:fast
npm run ci:release-trust
npm run ci:release-trust:locked
npm run ci:full
npm run preflight
```

Notes:

- `npm run release:trust:clean-generated` removes local generated release-trust noise directories (`.artifacts`, `.tmp`, `var`) without touching tracked source files.
- `npm run release:trust:baseline:ensure` bootstraps missing release-trust baseline artifacts from current artifacts and follows the current cutoff policy.
- `npm run validate:pr:fast` is the lightweight governance gate for rapid iteration.
- `npm run validate:release` is the full release authority lane.

### Build / Dev

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
npm run validate:fullstack
```

---

## Commands That Look Similar But Are Not

- `arch` vs `enforce:laws`
  They are the same audit today.

- `test:routes:smoke` vs `ui:interactions:test`
  `test:routes:smoke` is Playwright.
  `ui:interactions:test` is currently an architecture transition audit script.

- `validate:app` vs `test:all`
  `validate:app` checks build + Playwright app behavior.
  `test:all` checks core Node-based suites and architecture, but not Playwright.

- `validate:all` vs `validate:release`
  `validate:all` is broad local confidence.
  `validate:release` is the release authority lane.

---

## Recommended Defaults

For most day-to-day creator-facing work:

```bash
npm run test:architecture
npm run test:release:operator-surfaces
npm run validate:app
```

For verification translation work:

```bash
npm run test:routes:smoke
```

For kernel/runtime changes:

```bash
npm run test:kernel
npm run test:runtime:all
npm run determinism
```

For release-trust or governance work:

```bash
npm run validate:pr:fast
```

For a real release candidate:

```bash
npm run validate:release
```

---

## Final Principle

Use the smallest command surface that proves the change you made.

- local verification fix: run the smallest failing Playwright suite first
- UI / product flow change: run Playwright + app confidence
- kernel / runtime change: run focused runtime proofs + determinism
- architecture / governance change: run architecture + operator surfaces
- release candidate: run the release lane
