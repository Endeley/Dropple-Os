import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();

function read(relPath) {
    return fs.readFileSync(path.join(ROOT, relPath), 'utf8');
}

test('federation ingress validation remains coordination-only and reducer-free', () => {
    const source = read('runtime/orchestration/validateFederationIngress.js');
    assert.equal(/core\/events\/reducers\//.test(source), false);
    assert.equal(/runtime\/state\//.test(source), false);
    assert.equal(/\buseRuntimeStore\b/.test(source), false);
    assert.equal(/\.setState\s*\(/.test(source), false);
});
