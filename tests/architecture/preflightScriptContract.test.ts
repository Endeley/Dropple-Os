import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  GENERATED_DRIFT_TARGETS,
  RELEASE_TRUST_CLEAN_TARGETS,
} from '@/scripts/generatedDriftTargets.mjs';

const ROOT = process.cwd();

function readPackageJson() {
  const raw = fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8');
  return JSON.parse(raw);
}

function extractNpmRunCommands(markdown) {
  const commands = new Set();
  const fenced = markdown.match(/```bash[\s\S]*?```/g) ?? [];
  const npmRunPattern = /\bnpm run ([a-zA-Z0-9:_-]+)/g;

  for (const block of fenced) {
    let match = null;
    while ((match = npmRunPattern.exec(block)) !== null) {
      commands.add(match[1]);
    }
  }

  return [...commands].sort();
}

test('preflight script includes generated drift guard before fast gate', () => {
  const pkg = readPackageJson();
  const scripts = pkg?.scripts ?? {};

  assert.equal(typeof scripts['check:generated-drift'], 'string');
  assert.equal(typeof scripts.preflight, 'string');

  const preflight = scripts.preflight;
  assert.match(preflight, /npm run check:generated-drift/);
  assert.match(preflight, /npm run release:trust:clean-generated/);
  assert.match(preflight, /npm run release:trust:baseline:ensure/);
  assert.match(preflight, /npm run validate:pr:fast/);

  const checkIndex = preflight.indexOf('npm run check:generated-drift');
  const fastGateIndex = preflight.indexOf('npm run validate:pr:fast');
  assert.equal(checkIndex > -1, true);
  assert.equal(fastGateIndex > -1, true);
  assert.equal(checkIndex < fastGateIndex, true);

  // Contributor preflight must remain a fast confidence lane,
  // not a release-authority lane.
  assert.doesNotMatch(preflight, /npm run validate:release/);
  assert.doesNotMatch(preflight, /npm run test:release:attestation/);
  assert.doesNotMatch(preflight, /npm run release:trust:ledger/);
  assert.doesNotMatch(preflight, /npm run release:trust:ledger:verify/);
  assert.doesNotMatch(preflight, /npm run release:federation:lineage:ledger/);
  assert.doesNotMatch(preflight, /npm run release:federation:lineage:ledger:verify/);
});

test('runbook npm scripts are defined in package scripts', () => {
  const pkg = readPackageJson();
  const scripts = pkg?.scripts ?? {};

  const runbookPaths = [
    path.join(ROOT, 'docs', 'CONTRIBUTOR_PREFLIGHT_PLAYBOOK.md'),
    path.join(ROOT, 'docs', 'RELEASE_TRUST_TRIAGE_RUNBOOK.md'),
  ];

  for (const runbookPath of runbookPaths) {
    const markdown = fs.readFileSync(runbookPath, 'utf8');
    const commands = extractNpmRunCommands(markdown);
    for (const command of commands) {
      assert.equal(
        typeof scripts[command],
        'string',
        `runbook command npm run ${command} is not defined in package.json scripts`,
      );
    }
  }
});

test('contributing checklist includes canonical PR confidence sequence', () => {
  const pkg = readPackageJson();
  const scripts = pkg?.scripts ?? {};
  const contributingPath = path.join(ROOT, 'CONTRIBUTING.md');
  const markdown = fs.readFileSync(contributingPath, 'utf8');

  const requiredCommands = [
    'preflight',
    'test:release:attestation',
    'release:trust:report',
    'release:trust:summary',
    'validate:release',
  ];

  for (const command of requiredCommands) {
    assert.equal(
      typeof scripts[command],
      'string',
      `contributing checklist command npm run ${command} is not defined in package.json scripts`,
    );
    assert.match(
      markdown,
      new RegExp(`npm run ${command}`),
      `CONTRIBUTING.md is missing required command: npm run ${command}`,
    );
  }

  // Ensure release authority remains documented as separate from preflight.
  assert.match(markdown, /Release authority remains separate:/);
});

test('stabilization lock keeps core workflow scripts and ci release wiring intact', () => {
  const pkg = readPackageJson();
  const scripts = pkg?.scripts ?? {};
  const requiredScripts = [
    'preflight',
    'validate:pr:fast',
    'validate:release',
    'release:trust:report',
    'release:trust:summary',
    'test:release:operator-surfaces',
  ];

  for (const scriptName of requiredScripts) {
    assert.equal(
      typeof scripts[scriptName],
      'string',
      `stabilization lock missing package script: ${scriptName}`,
    );
  }

  const workflow = fs.readFileSync(path.join(ROOT, '.github', 'workflows', 'ci.yml'), 'utf8');
  assert.match(workflow, /name:\s*PR Release Validation \(validate:release\)/);
  assert.match(workflow, /run:\s*npm run validate:release/);
});

test('workspace interaction contract keeps alt-release duplicate semantics aligned with runtime law', () => {
  const interactionsSpec = fs.readFileSync(
    path.join(ROOT, 'tests', 'e2e', 'workspace-interactions.spec.js'),
    'utf8',
  );

  assert.match(
    interactionsSpec,
    /workspace new alt-drag releasing alt before threshold still duplicates from drag-start intent/,
  );
  assert.doesNotMatch(
    interactionsSpec,
    /workspace new alt-drag releasing alt before threshold stays non-duplicating and deterministic/,
  );
});

test('generated drift cleanup command in playbook stays aligned with canonical target list', () => {
  const playbook = fs.readFileSync(
    path.join(ROOT, 'docs', 'CONTRIBUTOR_PREFLIGHT_PLAYBOOK.md'),
    'utf8',
  );

  const restoreLineMatch = playbook.match(/git restore ([^\n]+)/);
  assert.ok(restoreLineMatch, 'playbook must include generated drift restore command');
  const listedTargets = restoreLineMatch[1].trim().split(/\s+/).filter(Boolean);

  assert.deepEqual(
    listedTargets,
    GENERATED_DRIFT_TARGETS,
    'playbook generated drift restore command must match canonical targets helper',
  );
});

test('test matrix release-trust cleanup targets stay aligned with canonical helper', () => {
  const matrix = fs.readFileSync(path.join(ROOT, 'docs', 'TEST_MATRIX.md'), 'utf8');
  const expected = RELEASE_TRUST_CLEAN_TARGETS.join('`, `');
  assert.match(
    matrix,
    new RegExp(
      `release:trust:clean-generated[\\s\\S]*\\(\\\`${expected}\\\`\\)`,
    ),
    'TEST_MATRIX.md cleanup target list must match canonical helper targets',
  );
});
