# Release Trust Triage Runbook

Status: Active  
Audience: CI operators, release maintainers, reviewers

## First 5 Minutes

1. Re-run and capture current trust outputs:

```bash
npm run release:trust:report
npm run release:trust:summary
npm run release:trust:diff
```

2. Read the first failing invariant in the diff output:
- `ERROR <invariant>: <message>`

3. Run focused suites by surface:

```bash
npm run test:release:operator-surfaces
npm run test:architecture
```

4. If baseline-related, run:

```bash
npm run release:trust:baseline:ensure
```

## Failure Reason → Command Matrix

### `missing-expected-tests`
- Meaning: expected probe tests were not found in Playwright JSON.
- Run:

```bash
npx playwright test tests/e2e/uiux-template-generation.spec.js --workers=1 -g "uiux authoring roundtrip publishes from the toolbar flow and installs into a fresh workspace|uiux transition timeline can author a motion keyframe through lawful intents"
npm run test:release:operator-surfaces
```

### `pointer-intercept-detected`
- Meaning: OS surface shell intercepted pointer events in probe flow.
- Run:

```bash
npm run release:trust:summary
npx playwright test tests/e2e/uiux-template-generation.spec.js --workers=1 -g "uiux authoring roundtrip publishes from the toolbar flow and installs into a fresh workspace|uiux transition timeline can author a motion keyframe through lawful intents"
```

### `playwright-exit-nonzero`
- Meaning: probe run failed before valid trust extraction.
- Run:

```bash
npm run build:e2e
npx playwright test tests/e2e/uiux-template-generation.spec.js --workers=1
```

### `probe-required-but-disabled`
- Meaning: probe disabled while required in CI/release policy.
- Run:

```bash
npm run release:trust:report
```

- Verify env policy:
- `RELEASE_TRUST_UI_PROBE`
- `RELEASE_TRUST_REQUIRE_UI_PROBE`
- `CI`

### `baseline report unavailable; diff skipped.`
- Meaning: no baseline report available pre-cutoff.
- Run:

```bash
npm run release:trust:baseline:ensure
npm run release:trust:baseline:capture
npm run release:trust:diff
```

### `baseline report unavailable after enforcement cutoff`
- Meaning: baseline missing after `RELEASE_TRUST_BASELINE_REQUIRED_AFTER`.
- Cutoff authority source: workflow-global env in `.github/workflows/ci.yml` (`2026-07-01T00:00:00.000Z`).
- Run:

```bash
npm run release:trust:baseline:ensure
npm run release:trust:baseline:capture
npm run release:trust:diff
```

If still failing after ensure/capture, treat as release-blocking.

## Common Invariant Failures

### `osSurfaceShellContract.*`
- Check shell contract projection and policy drift.
- Run:

```bash
npm run test:architecture
npm run test:release:operator-surfaces
```

### `osSurfaceWorkspaceIdentity.*`
- Check workspace/mode/overlay identity stability.
- Run:

```bash
npm run test:architecture
npm run release:trust:summary
```

### `osSurfaceActivationProvenance.*`
- Check activation tuple/source/overlay hash stability.
- Run:

```bash
npm run test:release:operator-surfaces
npm run test:architecture
```

### `osSurfaceShellRuntimeProbe.evidencePresent`
- Meaning: probe failed but no `failedTestTitle`/`traceHint`/stderr evidence.
- Run:

```bash
npm run release:trust:report
npm run release:trust:summary
```

Then collect Playwright trace/log evidence before retrying CI.

## Evidence Checklist (Attach to PR/Incident)

1. `.artifacts/release-trust.json`
2. `.artifacts/os-surface-clickability-probe.json`
3. `release:trust:summary` stdout
4. failing invariant lines from `release:trust:diff`
5. if probe failed: trace path hint and failing test title

## Escalation Rule

- If failure is constitutional (`classification=constitutional-regression`), do not override.
- Fix regression or explicitly roll back offending commit.
- Re-run:

```bash
npm run validate:pr:fast
```

before requesting review.
