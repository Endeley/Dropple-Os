import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();

function read(pathname) {
    return fs.readFileSync(path.join(ROOT, pathname), 'utf8');
}

test('workspace route smoke suite keeps project route bootstrap coverage for single and composed installs', () => {
    const smokeSpec = read('tests/e2e/workspace-routes.smoke.spec.js');

    assert.match(
        smokeSpec,
        /project perspective route bootstrap installs a single blueprint deterministically/,
    );
    assert.match(
        smokeSpec,
        /project perspective route bootstrap composes multiple blueprints deterministically/,
    );
    assert.match(smokeSpec, /\/workspace\/build\?blueprint=bp\.startup\.v1&bootstrap=1&entry=application/);
    assert.match(
        smokeSpec,
        /\/workspace\/build\?entry=application&blueprints=bp\.startup\.v1,bp\.logistics\.v1&bootstrap=1/,
    );
});

test('dispatcher workspace allowlist exemption includes project bootstrap event', () => {
    const dispatcherSource = read('runtime/dispatcher/dispatch.js');

    assert.match(
        dispatcherSource,
        /case EventTypes\.PROJECT_BLUEPRINT_BOOTSTRAP:\s*[\r\n]+\s*return true;/,
    );
});
