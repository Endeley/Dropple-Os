import test from 'node:test';
import assert from 'node:assert/strict';
import { compileTemplateV1 } from '../templateCompilerV1.js';
import { createTemplateSeed } from '../templateSeed.js';
import { certifyTemplateSeed } from '../certifyTemplateSeed.js';
import { createTemplateSeedLineageNode } from '../../../domain/templates/TemplateSeedLineageGraph.js';
import { verifyTemplateCertification } from '../../../domain/templates/TemplateCertification.js';

const templateFixture = Object.freeze({
    metadata: {
        id: 'template.phase3.lineage.v1',
        version: '1.0.0',
        name: 'Lineage Fixture',
        engine: 'dropple-motion@1.x',
        author: 'Dropple',
        license: 'dropple-marketplace-standard',
        createdAt: '2026-05-01',
        description: 'Seed lineage certification fixture',
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
            'title.text': { type: 'string', default: 'Phase 3' },
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

test('compiled template seeds carry deterministic content-hash inputs and root lineage identity', () => {
    const compiledA = compileTemplateV1(clone(templateFixture)).seed;
    const compiledB = compileTemplateV1(clone(templateFixture)).seed;

    assert.equal(compiledA.metadata.engine, templateFixture.metadata.engine);
    assert.deepEqual(compiledA.contentHashInputs, compiledB.contentHashInputs);
    assert.equal(compiledA.contentHash, compiledB.contentHash);
    assert.equal(compiledA.lineage.rootId, compiledA.lineage.nodeId);
    assert.equal(compiledA.lineage.rootId, compiledB.lineage.rootId);
    assert.equal(compiledA.lineage.type, 'seed');
    assert.deepEqual(compiledA.lineage.parentIds, []);
});

test('seed certification includes lineage root identity and remains verifiable', () => {
    const certifiedSeed = compileTemplateV1(clone(templateFixture)).seed;

    assert.equal(certifiedSeed.certification.lineageRootId, certifiedSeed.lineage.rootId);
    assert.equal(certifiedSeed.certification.lineageNodeId, certifiedSeed.lineage.nodeId);
    assert.equal(certifiedSeed.certification.contentHash, certifiedSeed.contentHash);
    assert.match(
        certifiedSeed.certification.certifiedAt,
        new RegExp(`^derived:${certifiedSeed.lineage.rootId.slice(0, 12)}:`),
    );
    assert.equal(
        verifyTemplateCertification({
            template: certifiedSeed,
            engineVersion: certifiedSeed.certification.engineVersion,
        }).valid,
        true,
    );
});

test('tampering certification lineage root identity invalidates the certified seed', () => {
    const certifiedSeed = compileTemplateV1(clone(templateFixture)).seed;
    const tamperedSeed = {
        ...certifiedSeed,
        certification: {
            ...certifiedSeed.certification,
            lineageRootId: 'tampered-lineage-root',
        },
    };

    const result = verifyTemplateCertification({
        template: tamperedSeed,
        engineVersion: certifiedSeed.certification.engineVersion,
    });

    assert.equal(result.valid, false);
    assert.equal(result.reason, 'Lineage root mismatch.');
});

test('same snapshot certified under a different lineage root yields a different certification hash', () => {
    const baseSeed = compileTemplateV1(clone(templateFixture)).seed;
    const alternateRoot = createTemplateSeedLineageNode({
        type: 'seed',
        parentIds: [],
        contentHash: 'alternate-lineage-root',
    });

    const derivedSeed = createTemplateSeed({
        id: baseSeed.id,
        version: baseSeed.version,
        snapshotHash: baseSeed.snapshotHash,
        baseSceneGraph: baseSeed.baseSceneGraph,
        states: baseSeed.states,
        defaultState: baseSeed.defaultState,
        capabilityProfile: baseSeed.capabilityProfile,
        metadata: baseSeed.metadata,
        params: baseSeed.params,
        contentHashInputs: baseSeed.contentHashInputs,
        lineage: {
            type: 'version',
            parentIds: [alternateRoot.id],
            rootId: alternateRoot.id,
        },
    });
    const certifiedDerivedSeed = certifyTemplateSeed(derivedSeed);

    assert.equal(certifiedDerivedSeed.snapshotHash, baseSeed.snapshotHash);
    assert.equal(certifiedDerivedSeed.contentHash, baseSeed.contentHash);
    assert.notEqual(certifiedDerivedSeed.lineage.rootId, baseSeed.lineage.rootId);
    assert.notEqual(
        certifiedDerivedSeed.certification.certificationHash,
        baseSeed.certification.certificationHash,
    );
    assert.equal(
        certifiedDerivedSeed.certification.lineageRootId,
        certifiedDerivedSeed.lineage.rootId,
    );
});
