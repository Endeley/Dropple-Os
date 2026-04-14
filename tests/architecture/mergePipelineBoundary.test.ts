import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();

function read(relPath) {
    return fs.readFileSync(path.join(ROOT, relPath), 'utf8');
}

test('pure merge pipeline files do not import runtime ui or dispatcher layers', () => {
    const pureFiles = [
        'branching/merge/computeMergeDiff.js',
        'branching/merge/planMerge.js',
        'branching/merge/simulateMergeState.js',
        'branching/merge/resolveBranchMergeArtifacts.js',
    ];
    const forbidden = [
        /@\/runtime\//,
        /@\/ui\//,
        /dispatcher/i,
        /store/i,
        /zustand/i,
    ];
    const violations = [];

    for (const relPath of pureFiles) {
        const content = read(relPath);
        const lines = content.split('\n');
        lines.forEach((line, index) => {
            if (!line.includes('import')) return;
            if (forbidden.some((pattern) => pattern.test(line))) {
                violations.push(`${relPath}:${index + 1}: ${line.trim()}`);
            }
        });
    }

    assert.deepEqual(violations, []);
});

test('merge application stays dispatcher-owned and branch ui does not set runtime directly', () => {
    const applyMergeContent = read('branching/merge/applyMerge.js');
    const mergeBranchContent = read('branching/ui/MergeBranch.jsx');

    assert.match(applyMergeContent, /dispatcher\.dispatch\(event\)/);
    assert.doesNotMatch(applyMergeContent, /setRuntimeState|syncRuntimeToZustand/);
    assert.doesNotMatch(mergeBranchContent, /setRuntimeState|syncRuntimeToZustand/);
    assert.match(mergeBranchContent, /applyMerge\(/);
});
