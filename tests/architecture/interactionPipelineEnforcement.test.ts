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
