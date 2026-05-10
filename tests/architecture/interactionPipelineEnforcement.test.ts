import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { runArchitectureGuard } from '@/scripts/architectureGuard.mjs';

const ROOT = process.cwd();

function read(pathname) {
    return fs.readFileSync(path.join(ROOT, pathname), 'utf8');
}

test('architecture laws document exists and defines the single interaction pipeline', () => {
    const content = read('docs/ARCHITECTURE_LAWS.md');

    assert.match(content, /# Dropple Architecture Laws/);
    assert.match(content, /Input -> Tool -> Drag -> Resolve -> Magnetic -> Reducer -> Projection -> UI/);
    assert.match(content, /No Temporary Authority/);
    assert.match(content, /Every implementation, optimization, and upgrade must use the final lawful authority model/);
});

test('constitutional law forbids temporary authority paths across implementation work', () => {
    const content = read('docs/LAW.md');

    assert.match(content, /No Temporary Authority Paths/);
    assert.match(content, /Dropple does not implement temporary authority paths/);
    assert.match(content, /This law applies every time Dropple implements, optimizes, or upgrades a system/);
    assert.match(content, /the feature waits/);
});

test('constitutional law defines deterministic execution provenance and coordination non-authority', () => {
    const content = read('docs/LAW.md');
    const architecture = read('docs/ARCHITECTURE_LAWS.md');

    assert.match(content, /Execution Provenance Law/);
    assert.match(content, /Execution provenance must be:/);
    assert.match(content, /deterministic/);
    assert.match(content, /immutable/);
    assert.match(content, /reconstructible/);
    assert.match(content, /replay-safe/);
    assert.match(content, /Resumed execution and uninterrupted execution must preserve canonical execution identity/);
    assert.match(content, /Execution coordination systems may not mutate:/);
    assert.match(content, /manifest truth/);
    assert.match(content, /session truth/);
    assert.match(content, /authored runtime truth/);

    assert.match(architecture, /Execution Provenance/);
    assert.match(architecture, /Resumed execution and uninterrupted execution must preserve canonical execution identity/);
    assert.match(architecture, /Coordination systems may not mutate manifest truth, session truth, or authored runtime truth/);
});

test('tool handlers dispatch events instead of mutating runtime truth directly', () => {
    const content = read('ui/bridges/toolHandlerRegistrationFacade.js');
    const lines = content.split('\n');
    const forbidden = [
        /runtimeState\.[A-Za-z0-9_.[\]]+\s*=/,
        /nodesById\[[^\]]+\]\s*=/,
        /node\.layout\.(x|y|width|height|rotation)\s*=/,
        /node\.(x|y|width|height|rotation)\s*=/,
    ];

    const violations = lines
        .map((line, index) => ({ line, index }))
        .filter(({ line }) => forbidden.some((pattern) => pattern.test(line)))
        .map(({ line, index }) => `ui/bridges/toolHandlerRegistrationFacade.js:${index + 1}: ${line.trim()}`);

    assert.deepEqual(violations, []);
});

test('interaction engines stay pure and do not depend on ui react dom or time randomness', () => {
    const content = read('scripts/architectureGuard.mjs');

    assert.match(content, /interaction-engine-purity/);
    assert.match(content, /from \['"\]react/);
    assert.match(content, /\\bwindow\\b/);
    assert.match(content, /\\bdocument\\b/);
    assert.match(content, /Math\\\.random/);
    assert.match(content, /Date\\\.now/);
});

test('architecture guard scanner runs without reporting violations', () => {
    assert.doesNotThrow(() => runArchitectureGuard());
});
