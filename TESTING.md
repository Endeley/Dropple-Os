# Testing

Dropple uses Node's test runner for most local suites.
Because the repo relies on path aliases such as `@/runtime`, `@/core`, and `@/engine`, full engine/runtime test runs must use the alias loader.

## Primary Commands

Use these scripts from the repo root:

```bash
npm run test:engine:all
npm run test:runtime:all
npm run test:core:all
npm run test:all
npm run validate:all
npm run architecture:phase
```

## What To Use

For normal feature work in compiler, engine, or runtime:

```bash
npm run test:core:all
```

Before pushing substantial changes:

```bash
npm run test:all
```

Before release or deeper validation:

```bash
npm run validate:all

For living architecture tracking:

```bash
npm run architecture:monitor
npm run architecture:score
npm run architecture:radar
npm run architecture:phase
```
```

## Script Meanings

`npm run test:engine:all`
Runs all tests under `engine/` with the alias loader.

`npm run test:runtime:all`
Runs all tests under `runtime/` with the alias loader.

`npm run test:core:all`
Runs both full engine and runtime suites.

`npm run test:all`
Runs:
- full engine suite
- full runtime suite
- kernel tests
- architecture tests
- UI interaction tests

`npm run validate:all`
Runs:
- `npm run test:all`
- determinism gate
- template verification
- architecture CI checks

## Direct Full-Suite Commands

If you need the raw commands instead of npm scripts:

```bash
node --import ./bench/register-alias-loader.mjs --test $(rg --files -g '*test*.mjs' -g '*test*.js' engine)
node --import ./bench/register-alias-loader.mjs --test $(rg --files -g '*test*.mjs' -g '*test*.js' runtime)
```

## Notes

- Raw `node --test` without the alias loader will fail for many runtime and engine files that import from `@/...`.
- Some narrow legacy scripts in `package.json` still exist for focused subsystems; keep using them when you only want a small slice of validation.
