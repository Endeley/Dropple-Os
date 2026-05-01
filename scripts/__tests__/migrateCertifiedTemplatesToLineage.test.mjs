import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { compileTemplateV1 } from '../../engine/templates/templateCompilerV1.js';
import { certifyTemplate } from '../../domain/templates/TemplateCertification.js';
import {
    migrateCertifiedTemplatesToLineage,
    migrateLegacyCertifiedEntries,
} from '../migrateCertifiedTemplatesToLineage.mjs';

const seedTemplateFixture = Object.freeze({
    metadata: {
        id: 'tpl.legacy.seed',
        version: '1.0.0',
        name: 'Legacy Seed',
        engine: 'dropple-motion@1.x',
        author: 'Dropple',
        license: 'dropple-marketplace-standard',
        createdAt: '2026-05-01',
        description: 'Legacy seed registry fixture',
    },
    structure: {
        root: 'scene',
        nodes: [
            { id: 'scene', type: 'Scene' },
            { id: 'title', type: 'Text' },
        ],
        tree: {
            scene: ['title'],
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
            'title.text': { type: 'string', default: 'Legacy Seed' },
        },
    },
    runtime: {
        viewport: ['desktop'],
        autoplay: true,
    },
});

function clone(value) {
    if (typeof structuredClone === 'function') return structuredClone(value);
    return JSON.parse(JSON.stringify(value));
}

function buildLegacySeedEntry() {
    const seed = compileTemplateV1(clone(seedTemplateFixture)).seed;
    const legacy = clone(seed);
    delete legacy.contentHash;
    delete legacy.contentHashInputs;
    delete legacy.lineage;
    if (legacy.certification) {
        delete legacy.certification.contentHash;
        delete legacy.certification.lineageRootId;
        delete legacy.certification.lineageNodeId;
        delete legacy.certification.certificationHash;
    }
    return legacy;
}

function buildLegacyGraphEntry() {
    const { privateKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
    });

    return certifyTemplate({
        template: {
            id: 'tpl.legacy.graph',
            version: '1.0.0',
            mode: 'animation',
            graph: {
                baseStateId: 'state:base',
                states: [
                    { id: 'state:base', label: 'Base', propertyOverrides: {}, domainMeta: {} },
                ],
                transitions: [],
                triggers: [],
            },
            metadata: {
                name: 'Legacy Graph',
                description: 'Legacy graph registry fixture',
                author: 'Dropple',
                createdAt: '2026-05-01',
                compatibleEngineVersion: 'dropple-motion@1.x',
                tags: ['legacy'],
            },
        },
        engineVersion: 'dropple-motion@1.x',
        privateKey,
    });
}

test('migration script upgrades flat legacy entries into a deterministic lineage-aware registry envelope', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dropple-template-migrate-'));
    const legacyEntries = [buildLegacySeedEntry(), buildLegacyGraphEntry()];
    fs.mkdirSync(path.join(tempDir, '.registry'), { recursive: true });
    fs.writeFileSync(
        path.join(tempDir, '.registry', 'certifiedTemplates.json'),
        JSON.stringify(legacyEntries, null, 2),
    );

    const first = migrateCertifiedTemplatesToLineage({ cwd: tempDir });
    const secondTempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dropple-template-migrate-'));
    fs.mkdirSync(path.join(secondTempDir, '.registry'), { recursive: true });
    fs.writeFileSync(
        path.join(secondTempDir, '.registry', 'certifiedTemplates.json'),
        JSON.stringify(legacyEntries, null, 2),
    );
    const second = migrateCertifiedTemplatesToLineage({ cwd: secondTempDir });

    const migrated = JSON.parse(
        fs.readFileSync(path.join(tempDir, '.registry', 'certifiedTemplates.json'), 'utf8'),
    );

    assert.equal(first.migrated, true);
    assert.equal(second.migrated, true);
    assert.equal(first.fingerprint, second.fingerprint);
    assert.equal(migrated.format, 'dropple-certified-template-registry@2');
    assert.equal(migrated.version, 2);
    assert.equal(migrated.entries.length, 2);
    assert.ok(fs.existsSync(path.join(tempDir, '.registry', 'certifiedTemplates.legacy.backup.json')));

    const migratedSeed = migrated.entries.find((entry) => entry.id === 'tpl.legacy.seed');
    const migratedGraph = migrated.entries.find((entry) => entry.id === 'tpl.legacy.graph');

    assert.ok(migratedSeed.versionId);
    assert.equal(migratedSeed.lineageRootId, migratedSeed.versionId);
    assert.deepEqual(migratedSeed.parentVersionIds, []);
    assert.equal(migratedSeed.certification.lineageNodeId, migratedSeed.versionId);

    assert.ok(migratedGraph.versionId);
    assert.equal(migratedGraph.lineageRootId, migratedGraph.versionId);
    assert.deepEqual(migratedGraph.parentVersionIds, []);
    assert.equal(migratedGraph.certification.lineageNodeId, migratedGraph.versionId);
});

test('migration helper is a no-op for already migrated v2 registries', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dropple-template-migrate-'));
    const migratedEntries = migrateLegacyCertifiedEntries([buildLegacySeedEntry()]);
    const envelope = {
        format: 'dropple-certified-template-registry@2',
        version: 2,
        entries: migratedEntries,
        lineageRoots: {
            [migratedEntries[0].lineageRootId]: [migratedEntries[0].versionId],
        },
    };

    fs.mkdirSync(path.join(tempDir, '.registry'), { recursive: true });
    fs.writeFileSync(
        path.join(tempDir, '.registry', 'certifiedTemplates.json'),
        JSON.stringify(envelope, null, 2),
    );

    const result = migrateCertifiedTemplatesToLineage({ cwd: tempDir });
    assert.equal(result.migrated, false);
    assert.equal(result.reason, 'already-v2');
});
