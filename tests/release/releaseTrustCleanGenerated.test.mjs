import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { cleanReleaseTrustGenerated } from '@/scripts/releaseTrustCleanGenerated.mjs';

test('release trust generated cleanup removes only configured directories', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'dropple-release-trust-clean-'));
    const artifacts = path.join(root, '.artifacts');
    const tmpDir = path.join(root, '.tmp');
    const varDir = path.join(root, 'var');
    const keepFile = path.join(root, 'keep.txt');

    fs.mkdirSync(artifacts, { recursive: true });
    fs.mkdirSync(tmpDir, { recursive: true });
    fs.mkdirSync(varDir, { recursive: true });
    fs.writeFileSync(path.join(artifacts, 'a.json'), '{}', 'utf8');
    fs.writeFileSync(path.join(tmpDir, 'b.tmp'), '1', 'utf8');
    fs.writeFileSync(path.join(varDir, 'c.log'), '2', 'utf8');
    fs.writeFileSync(keepFile, 'keep', 'utf8');

    const result = cleanReleaseTrustGenerated({ cwd: root });

    assert.equal(result.results.length, 3);
    assert.equal(result.results.every((entry) => entry.removed), true);
    assert.equal(fs.existsSync(artifacts), false);
    assert.equal(fs.existsSync(tmpDir), false);
    assert.equal(fs.existsSync(varDir), false);
    assert.equal(fs.readFileSync(keepFile, 'utf8'), 'keep');

    fs.rmSync(root, { recursive: true, force: true });
});

test('release trust generated cleanup is deterministic when targets are absent', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'dropple-release-trust-clean-'));

    const result = cleanReleaseTrustGenerated({ cwd: root });

    assert.equal(result.results.length, 3);
    assert.equal(result.results.every((entry) => entry.removed === false), true);

    fs.rmSync(root, { recursive: true, force: true });
});
