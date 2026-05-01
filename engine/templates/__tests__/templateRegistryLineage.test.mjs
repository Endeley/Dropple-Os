import test from 'node:test';
import assert from 'node:assert/strict';
import {
    getTemplateByVersionId,
    listTemplateLineage,
    listTemplates,
    registerTemplate,
    resetTemplateRegistry,
} from '../templateRegistry.js';
import { compileTemplateV1 } from '../templateCompilerV1.js';
import { createTemplateSeed } from '../templateSeed.js';
import { createTemplateSeedLineageNode } from '../../../domain/templates/TemplateSeedLineageGraph.js';

const templateFixture = Object.freeze({
    metadata: {
        id: 'template.registry.lineage.v1',
        version: '1.0.0',
        name: 'Registry Lineage Fixture',
        engine: 'dropple-motion@1.x',
        author: 'Dropple',
        license: 'dropple-marketplace-standard',
        createdAt: '2026-05-01',
        description: 'Registry lineage fixture',
    },
    structure: {
        root: 'scene',
        nodes: [
            { id: 'scene', type: 'Scene' },
            { id: 'card', type: 'Container' },
            { id: 'title', type: 'Text' },
        ],
        tree: {
            scene: ['card'],
            card: ['title'],
        },
    },
    motion: {
        timelines: {
            intro: {
                duration: 1000,
                tracks: [
                    {
                        target: 'title',
                        property: 'opacity',
                        keyframes: [
                            { t: 0, v: 0 },
                            { t: 600, v: 1 },
                        ],
                    },
                ],
            },
        },
        triggers: {
            onLoad: 'intro',
        },
    },
    params: {
        content: {
            'title.text': { type: 'string', default: 'Registry' },
        },
    },
    runtime: {
        viewport: ['desktop'],
        autoplay: true,
    },
});

function clone(value) {
    if (typeof structuredClone === 'function') {
        return structuredClone(value);
    }

    return JSON.parse(JSON.stringify(value));
}

function buildSeed(version) {
    const template = clone(templateFixture);
    template.metadata.version = version;
    return compileTemplateV1(template).seed;
}

function buildDerivedSeed(baseSeed, version, lineage) {
    return createTemplateSeed({
        id: baseSeed.id,
        version,
        snapshotHash: baseSeed.snapshotHash,
        baseSceneGraph: baseSeed.baseSceneGraph,
        states: baseSeed.states,
        defaultState: baseSeed.defaultState,
        capabilityProfile: baseSeed.capabilityProfile,
        metadata: baseSeed.metadata,
        params: baseSeed.params,
        contentHashInputs: baseSeed.contentHashInputs,
        lineage,
    });
}

test.afterEach(() => {
    resetTemplateRegistry();
});

test('template registry stores lineage-aware metadata and parent linkage deterministically', () => {
    const rootSeed = buildSeed('1.0.0');
    const registeredRoot = registerTemplate(rootSeed);
    const childSeed = buildDerivedSeed(rootSeed, '1.1.0', {
        type: 'version',
        rootId: rootSeed.lineage.rootId,
        parentIds: [rootSeed.lineage.nodeId],
    });
    const registeredChild = registerTemplate(childSeed);

    assert.equal(registeredRoot.lineageRootId, rootSeed.lineage.rootId);
    assert.equal(registeredRoot.versionId, rootSeed.lineage.nodeId);
    assert.deepEqual(registeredRoot.parentVersionIds, []);

    assert.equal(registeredChild.lineageRootId, rootSeed.lineage.rootId);
    assert.deepEqual(registeredChild.parentVersionIds, [rootSeed.lineage.nodeId]);
    assert.equal(getTemplateByVersionId(registeredChild.versionId)?.version, '1.1.0');
    assert.deepEqual(
        listTemplateLineage(rootSeed.lineage.rootId).map((seed) => seed.version),
        ['1.0.0', '1.1.0'],
    );
    assert.deepEqual(
        listTemplates().map((seed) => seed.versionId),
        [registeredRoot.versionId, registeredChild.versionId],
    );
});

test('template registry rejects unknown lineage parents', () => {
    const rootSeed = buildSeed('1.0.0');
    const orphanParent = createTemplateSeedLineageNode({
        type: 'seed',
        parentIds: [],
        contentHash: 'orphan-parent-root',
    });
    const invalidChildSeed = buildDerivedSeed(rootSeed, '1.1.0', {
        type: 'version',
        rootId: orphanParent.id,
        parentIds: [orphanParent.id],
    });

    assert.throws(
        () => registerTemplate(invalidChildSeed),
        /Unknown template lineage parent/,
    );
});

test('template registry rejects lineage root mismatches across parent linkage', () => {
    const rootSeed = buildSeed('1.0.0');
    registerTemplate(rootSeed);

    const otherRoot = createTemplateSeedLineageNode({
        type: 'seed',
        parentIds: [],
        contentHash: 'other-root-content',
    });
    const mismatchedSeed = buildDerivedSeed(rootSeed, '1.1.0', {
        type: 'version',
        rootId: otherRoot.id,
        parentIds: [rootSeed.lineage.nodeId],
    });

    assert.throws(
        () => registerTemplate(mismatchedSeed),
        /Template lineage root mismatch/,
    );
});

test('template registry allows identical snapshot hashes across lawful lineage versions', () => {
    const rootSeed = buildSeed('1.0.0');
    const childSeed = buildDerivedSeed(rootSeed, '1.1.0', {
        type: 'version',
        rootId: rootSeed.lineage.rootId,
        parentIds: [rootSeed.lineage.nodeId],
    });

    const registeredRoot = registerTemplate(rootSeed);
    const registeredChild = registerTemplate(childSeed);

    assert.equal(registeredRoot.snapshotHash, registeredChild.snapshotHash);
    assert.notEqual(registeredRoot.versionId, registeredChild.versionId);
    assert.equal(listTemplates().length, 2);
});
