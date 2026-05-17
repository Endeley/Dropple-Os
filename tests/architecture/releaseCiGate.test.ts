import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();

function read(pathname) {
    return fs.readFileSync(path.join(ROOT, pathname), 'utf8');
}

test('pull request CI workflow runs validate:release as a required release gate', () => {
    const workflow = read('.github/workflows/ci.yml');

    assert.match(workflow, /release-trust-gate-pr:/);
    assert.match(workflow, /name:\s*PR Release Validation \(validate:release\)/);
    assert.match(workflow, /if:\s*github\.event_name\s*==\s*'pull_request'/);
    assert.match(workflow, /run:\s*npm run validate:release/);
});
