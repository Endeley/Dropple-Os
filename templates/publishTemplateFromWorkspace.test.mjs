import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { publishTemplateFromWorkspace } from './publishTemplateFromWorkspace.js';
import { installCertifiedTemplate } from '@/domain/templates/installCertifiedTemplate.js';

function createDocument() {
    return {
        sceneGraph: {
            rootIds: ['root'],
            nodes: {
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
            },
        },
        motion: {
            clips: {
                'clip-headline-opacity': {
                    id: 'clip-headline-opacity',
                    target: 'headline',
                    property: 'opacity',
                    keyframes: [
                        { id: 'kf-0', t: 0, v: 0 },
                        { id: 'kf-500', t: 500, v: 1, easing: 'ease-in' },
                    ],
                },
                'clip-headline-translateY': {
                    id: 'clip-headline-translateY',
                    target: 'headline',
                    property: 'translateY',
                    keyframes: [
                        { id: 'kf-y-0', t: 0, v: 24 },
                        { id: 'kf-y-500', t: 500, v: 0, easing: 'ease-in-out' },
                    ],
                },
            },
        },
    };
}

test('publishTemplateFromWorkspace closes publish -> compile -> certify -> register with motion preserved', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dropple-template-publish-'));
    const originalCwd = process.cwd();

    process.chdir(tempDir);

    try {
        const result = publishTemplateFromWorkspace({
            document: createDocument(),
            metadata: {
                title: 'Hero Motion Template',
                description: 'Roundtrip fixture',
            },
            workspaceMode: 'design',
        });

        assert.equal(result.artifact.motion.timelines.default.duration, 500);
        assert.equal(result.artifact.motion.timelines.default.tracks[0].target, 'headline');
        assert.equal(result.artifact.motion.timelines.default.tracks[1].property, 'translateY');
        assert.deepEqual(
            result.seed.states.default.channels.map((channel) => ({
                id: channel.id,
                property: channel.property,
                target: channel.target,
            })),
            [
                { id: 'opacity', property: 'opacity', target: 'headline' },
                { id: 'transform.y', property: 'translateY', target: 'headline' },
            ],
        );
        assert.equal(result.seed.certification.certified, true);
        assert.equal(result.seed.mode, 'design');
        assert.ok(fs.existsSync(path.join(tempDir, '.registry', 'certifiedTemplates.json')));

        const registry = JSON.parse(
            fs.readFileSync(path.join(tempDir, '.registry', 'certifiedTemplates.json'), 'utf8'),
        );

        assert.equal(registry.length, 1);
        assert.equal(registry[0].id, result.seed.id);
        assert.equal(registry[0].snapshotHash, result.seed.snapshotHash);
    } finally {
        process.chdir(originalCwd);
    }
});

test('installCertifiedTemplate hydrates seed-backed templates into canonical runtime truth', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dropple-template-install-'));
    const originalCwd = process.cwd();

    process.chdir(tempDir);

    try {
        const published = publishTemplateFromWorkspace({
            document: createDocument(),
            metadata: {
                title: 'Installable Motion Template',
            },
            workspaceMode: 'design',
        });

        let hydrated = null;
        const dispatcher = {
            hydrateRuntimeState(nextState) {
                hydrated = nextState;
            },
        };

        const result = installCertifiedTemplate({
            dispatcher,
            template: published.seed,
        });

        assert.equal(result.installed, true);
        assert.ok(hydrated);
        assert.deepEqual(hydrated.document.sceneGraph.rootIds, ['root']);
        assert.deepEqual(
            hydrated.timeline.timelines.default.channels.map((channel) => ({
                id: channel.id,
                property: channel.property,
                target: channel.target,
            })),
            [
                { id: 'opacity', property: 'opacity', target: 'headline' },
                { id: 'transform.y', property: 'translateY', target: 'headline' },
            ],
        );
        assert.equal(
            hydrated.document.motion.clips['clip:headline:opacity'].keyframes[1].easing,
            'easeInOut',
        );
        assert.equal(
            hydrated.document.motion.clips['clip:headline:translateY'].keyframes[0].v,
            24,
        );
    } finally {
        process.chdir(originalCwd);
    }
});
