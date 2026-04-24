import test from 'node:test';
import assert from 'node:assert/strict';

import { workspaceToCCMTemplate } from './workspaceToCCMTemplate.js';

function createDocument(nodes, rootIds = ['root'], motionTarget = 'headline') {
    return {
        sceneGraph: {
            rootIds,
            nodes,
        },
        motion: {
            clips: {
                'clip-headline-opacity': {
                    id: 'clip-headline-opacity',
                    target: motionTarget,
                    property: 'opacity',
                    keyframes: [
                        { id: 'kf-0', t: 0, v: 0 },
                        { id: 'kf-600', t: 600, v: 1 },
                    ],
                },
                'clip-headline-translateY': {
                    id: 'clip-headline-translateY',
                    target: motionTarget,
                    property: 'translateY',
                    keyframes: [
                        { id: 'kf-y-0', t: 0, v: 20 },
                        { id: 'kf-y-600', t: 600, v: 0, easing: 'ease-in-out' },
                    ],
                },
            },
        },
    };
}

test('workspaceToCCMTemplate emits a valid CCM artifact for a simple UIUX scene', () => {
    const artifact = workspaceToCCMTemplate({
        document: createDocument({
            root: {
                id: 'root',
                type: 'frame',
                children: ['headline'],
            },
            headline: {
                id: 'headline',
                type: 'text',
                children: [],
            },
        }),
        events: [],
        workspaceMode: 'design',
        metadata: {
            id: 'tpl.uiux.hero',
            version: '1.0.0',
            name: 'Hero Template',
            engine: 'dropple-motion@1.x',
        },
    });

    assert.equal(artifact.metadata.id, 'tpl.uiux.hero');
    assert.equal(artifact.structure.root, 'root');
    assert.deepEqual(
        artifact.structure.nodes.map((node) => node.id),
        ['headline', 'root'],
    );
    assert.deepEqual(artifact.structure.tree.root, ['headline']);
    assert.equal(artifact.motion.triggers.onLoad, 'default');
    assert.equal(artifact.motion.timelines.default.duration, 600);
    assert.equal(artifact.motion.timelines.default.tracks[0].target, 'headline');
    assert.equal(artifact.motion.timelines.default.tracks[0].property, 'opacity');
    assert.equal(artifact.motion.timelines.default.tracks[1].property, 'translateY');
});

test('workspaceToCCMTemplate is deterministic under node storage reordering', () => {
    const metadata = {
        id: 'tpl.uiux.reordered',
        version: '1.0.0',
        name: 'Reordered Template',
        engine: 'dropple-motion@1.x',
    };

    const a = workspaceToCCMTemplate({
        document: createDocument({
            root: { id: 'root', type: 'frame', children: ['b', 'a'] },
            b: { id: 'b', type: 'text', children: [] },
            a: { id: 'a', type: 'text', children: [] },
        }, ['root'], 'a'),
        metadata,
    });

    const b = workspaceToCCMTemplate({
        document: createDocument({
            a: { id: 'a', type: 'text', children: [] },
            root: { id: 'root', type: 'frame', children: ['a', 'b'] },
            b: { id: 'b', type: 'text', children: [] },
        }, ['root'], 'a'),
        metadata,
    });

    assert.deepEqual(a, b);
});

test('workspaceToCCMTemplate rejects empty scene graphs', () => {
    assert.throws(
        () =>
            workspaceToCCMTemplate({
                document: createDocument({}, []),
                metadata: {
                    id: 'tpl.empty',
                    version: '1.0.0',
                    name: 'Empty',
                    engine: 'dropple-motion@1.x',
                },
            }),
        /at least one scene graph node/i,
    );
});
