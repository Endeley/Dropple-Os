# Contributor Preflight Playbook

Status: Active  
Audience: Contributors, reviewers, maintainers  
Scope: Daily confidence flow vs release authority flow

## Intent

Keep contributor feedback loops fast and deterministic while preserving a separate, stricter release gate.

- `preflight` = contributor confidence
- `validate:release` = release authority

Do not collapse these into one command path.

## Daily Flow (Before and During Development)

Run this when you start work and before opening/updating a PR:

```bash
npm run preflight
```

This executes:

1. `npm run release:trust:clean-generated`
2. `npm run release:trust:baseline:ensure`
3. `npm run validate:pr:fast`

Expected outcome:

- local generated trust noise is cleaned
- baseline state is available or explicitly warn-open pre-cutoff
- architecture and release operator surfaces pass

## PR Flow (Contributor Confidence)

Use this sequence when preparing a PR update:

```bash
npm run preflight
npm run test:release:attestation
npm run release:trust:report
npm run release:trust:summary
```

Expected outcome:

- attestation and operator surfaces are green
- trust report is generated with deterministic checks
- summary is readable for reviewers and includes explicit OS surface sections

## Release Flow (Authority Gate)

Use this sequence for release decisions:

```bash
npm run ci:full
```

Equivalent:

```bash
npm run validate:release
```

Expected outcome:

- full constitutional/runtime/system/e2e/release trust gates pass
- release authority remains separated from contributor preflight

## Failure Routing

When `preflight` fails:

1. Re-run focused failing command from the output.
2. If trust-related, run:

```bash
npm run release:trust:report
npm run release:trust:summary
npm run release:trust:diff
```

3. Follow detailed remediation in:
- `docs/RELEASE_TRUST_TRIAGE_RUNBOOK.md`

## Baseline Policy Notes

- `release:trust:baseline:ensure` is fail-open before cutoff and fail-closed after cutoff.
- Cutoff is controlled by `RELEASE_TRUST_BASELINE_REQUIRED_AFTER`.
- Pre-cutoff warning:
- `baseline report unavailable; diff skipped.`
- This is expected until baseline enforcement is activated.

## Command Ladder Summary

Daily:

```bash
npm run preflight
```

PR-ready:

```bash
npm run preflight
npm run test:release:attestation
npm run release:trust:report
npm run release:trust:summary
```

Release:

```bash
npm run ci:full
```
