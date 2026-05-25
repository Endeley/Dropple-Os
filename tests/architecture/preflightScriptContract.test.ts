import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

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
