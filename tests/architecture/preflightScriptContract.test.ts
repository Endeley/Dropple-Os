import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();

function readPackageJson() {
  const raw = fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8');
  return JSON.parse(raw);
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
