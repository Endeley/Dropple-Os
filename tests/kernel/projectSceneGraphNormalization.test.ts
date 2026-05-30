import test from 'node:test';
import assert from 'node:assert/strict';

import { normalizeShotTransitionOut } from '../../core/project/normalizeShotTransitionOut.js';
import { normalizeProjectUniverseArtifacts } from '../../core/project/normalizeProjectUniverseArtifacts.js';

function createProjectWithShot(transitionOut) {
    return {
        version: 2,
        id: 'project-1',
        name: 'Project',
        compositions: {
            root: { id: 'root', name: 'Root' },
        },
        assets: {},
        sceneGraph: {
            version: 1,
            activeSceneId: 'scene-1',
            activeShotId: 'shot-1',
            scenes: [
                {
                    id: 'scene-1',
                    name: 'Scene 1',
                    duration: 1000,
                    shots: [
                        {
                            id: 'shot-1',
                            name: 'Shot 1',
                            start: 0,
                            duration: 1000,
                            compositionId: 'root',
                            transitionOut,
                        },
                    ],
                },
            ],
        },
    };
}

test('normalizeShotTransitionOut canonicalizes partial cut transition metadata', () => {
    const shot = createProjectWithShot({ type: 'cut' }).sceneGraph.scenes[0].shots[0];

    const result = normalizeShotTransitionOut(shot);

    assert.deepEqual(result.transitionOut, {
        type: 'cut',
        durationMs: 0,
    });
});

test('normalizeShotTransitionOut rejects unsupported transition types', () => {
    const shot = createProjectWithShot({ type: 'wipe', durationMs: 100 }).sceneGraph.scenes[0].shots[0];

    assert.throws(
        () => normalizeShotTransitionOut(shot),
        /unsupported shot\.transitionOut type wipe/,
    );
});

test('normalizeShotTransitionOut rejects negative transition durations', () => {
    const shot = createProjectWithShot({ type: 'crossfade', durationMs: -1 }).sceneGraph.scenes[0].shots[0];

    assert.throws(
        () => normalizeShotTransitionOut(shot),
        /shot\.transitionOut\.durationMs must be a finite number >= 0/,
    );
});

test('normalizeShotTransitionOut normalizes transition metadata deterministically', () => {
    const shot = createProjectWithShot({ type: 'crossfade', durationMs: 200 }).sceneGraph.scenes[0].shots[0];

    const left = normalizeShotTransitionOut(shot);
    const right = normalizeShotTransitionOut(shot);

    assert.deepEqual(left.transitionOut, {
        type: 'crossfade',
        durationMs: 200,
    });
    assert.deepEqual(left, right);
});

test('normalizeProjectUniverseArtifacts canonicalizes project hub and refs deterministically', () => {
    const input = {
        version: 99,
        hubId: 'missing-hub',
        nodes: {
            z: { kind: 'workflow', refs: ['a', 'a', '  b  '] },
            a: { kind: 'project-hub', x: 10, y: 20, label: '  Hub  ' },
            bad: { kind: 'unsupported-kind', refs: [null, 9] },
        },
    };

    const left = normalizeProjectUniverseArtifacts(input);
    const right = normalizeProjectUniverseArtifacts(input);

    assert.equal(left.version, 1);
    assert.equal(left.hubId, 'a');
    assert.deepEqual(Object.keys(left.nodes), ['a', 'bad', 'z']);
    assert.equal(left.nodes.bad.kind, 'document');
    assert.deepEqual(left.nodes.z.refs, ['a', 'b']);
    assert.equal(left.nodes.a.label, 'Hub');
    assert.deepEqual(left, right);
});
