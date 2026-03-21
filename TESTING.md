# Dropple Testing Guide

This is the current test and validation map for the repo.

## Run Tags

### `[focused]`
Smallest useful local run for one area you touched.

### `[fast]`
Quick confidence checks during feature work.

### `[standard]`
Recommended before commit.

### `[app]`
Includes app build and route/browser coverage.

### `[gate]`
CI-style enforcement or determinism gate.

### `[release]`
Full release validation.

## Recommended Run Order

### Small change
```sh
npm run test:architecture
```

Then run the smallest relevant suite:
- runtime work: `npm run test:runtime:all`
- engine work: `npm run test:engine:all`
- dispatcher/kernel work: `npm run test:kernel`
- UI tool/input work: `npm run ui:interactions:test`

### Before commit
```sh
npm run test:all
```

### Before merging app-facing changes
```sh
npm run validate:app
```

### Before release
```sh
npm run validate:release
```

## Primary Commands

### `[fast]` Architecture
```sh
npm run test:architecture
```
Runs:
- `tests/architecture/*.test.ts`

Purpose:
- boundary enforcement
- reducer ownership
- import rules
- interaction pipeline enforcement

### `[fast]` Kernel
```sh
npm run test:kernel
```
Runs:
- `tests/kernel/*.test.ts`

Purpose:
- dispatcher truth
- replay equivalence
- persistence roundtrip
- runtime projection purity

### `[fast]` UI interaction tests
```sh
npm run ui:interactions:test
```
Runs:
- `ui/interactions/__tests__/toolController.test.mjs`

Purpose:
- tool-controller/UI interaction checks

### `[fast]` Engine suite
```sh
npm run test:engine:all
```
Runs discovered tests under:
- `engine/`

Purpose:
- compiler
- timeline
- design-system
- determinism-oriented engine behavior

### `[fast]` Runtime suite
```sh
npm run test:runtime:all
```
Runs discovered tests under:
- `runtime/`

Purpose:
- runtime interaction
- animation
- snapping
- guides
- scene evaluation
- workspaces
- tools

### `[standard]` Core suite
```sh
npm run test:core:all
```
Runs:
- `npm run test:engine:all`
- `npm run test:runtime:all`

### `[standard]` Main local suite
```sh
npm run test:all
```
Runs:
- `npm run test:core:all`
- `npm run test:kernel`
- `npm run test:architecture`
- `npm run ui:interactions:test`

## App and System Validation

### `[app]` Build smoke
```sh
npm run build:smoke
```
Runs:
- `next build`

### `[app]` Route smoke
```sh
npm run test:routes:smoke
```
Runs:
- `playwright test tests/e2e`

Requires:
- Playwright browsers installed

### `[app]` App validation
```sh
npm run validate:app
```
Runs:
- `npm run build:smoke`
- `npm run test:routes:smoke`

### `[gate]` Runtime system tests
```sh
npm run test:system:runtime
```
Runs:
- `tests/system/*.test.mjs`

### `[app]` System app validation
```sh
npm run test:system:app
```
Runs:
- `npm run validate:app`

### `[app]` Full system validation
```sh
npm run test:system:all
```
Runs:
- `npm run test:system:runtime`
- `npm run test:system:app`

## Gates

### `[gate]` Determinism
```sh
npm run determinism
```
Purpose:
- deterministic output gate

### `[gate]` Architecture guard
```sh
npm run architecture:guard
```
Purpose:
- illegal pattern scanning
- interaction architecture enforcement

### `[gate]` Architecture CI
```sh
npm run architecture:ci
```
Runs:
- `node scripts/architectureCi.mjs`
- `node scripts/architectureGuard.mjs`

Purpose:
- critical system integration gate
- architecture guard enforcement

### `[gate]` Template verification
```sh
npm run template:verify-all
```

## Full Validation

### `[gate]` Main CI validation
```sh
npm run validate:all
```
Runs:
- `npm run test:all`
- `npm run test:system:all`
- `npm run determinism`
- `npm run architecture:ci`

### `[release]` Release validation
```sh
npm run validate:release
```
Runs:
- `npm run validate:all`
- `npm run template:verify-all`

## Focused Single-File Runs

### Runtime or engine `.mjs` tests
```sh
node --import ./bench/register-alias-loader.mjs --test runtime/interaction/__tests__/dragEngine.test.mjs
```

You can replace the path with any runtime or engine test file.

### Architecture tests
```sh
node --import ./tests/register-test-loaders.mjs --test tests/architecture/*.test.ts
```

### Kernel tests
```sh
node --import ./tests/register-test-loaders.mjs --test tests/kernel/*.test.ts
```

## Named Script Inventory

### `[focused]` Engine point checks
- `npm run engine:test`
- `npm run engine:shot:test`
- `npm run engine:track:test`
- `npm run engine:timeline:test`
- `npm run engine:dispatcher:test`
- `npm run engine:projection:test`
- `npm run engine:timeline:evaluate:test`
- `npm run engine:timeline:history:test`
- `npm run engine:timeline:controller:test`
- `npm run engine:timeline:controller:diff:test`
- `npm run engine:timeline:diff:test`
- `npm run engine:export:stability:test`
- `npm run engine:track:lock:test`
- `npm run engine:track:blend:test`
- `npm run engine:track:group:test`
- `npm run engine:timeline:dag:test`
- `npm run engine:timeline:label:test`

### `[focused]` Runtime point checks
- `npm run runtime:map:test`
- `npm run runtime:replay:test`
- `npm run runtime:statehash:test`
- `npm run runtime:resize:session:test`

## Practical Policy

### If you changed runtime interaction
```sh
npm run test:runtime:all
npm run test:architecture
```

### If you changed dispatcher or truth ownership
```sh
npm run test:kernel
npm run test:architecture
```

### If you changed compiler or engine behavior
```sh
npm run test:engine:all
npm run test:architecture
```

### If you changed workspace UI routing or shell behavior
```sh
npm run test:all
npm run validate:app
```

### If you want maximum confidence
```sh
npm run validate:release
```
