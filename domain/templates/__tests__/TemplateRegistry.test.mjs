import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { compileTemplateV1 } from '../../../engine/templates/templateCompilerV1.js';
import { createTemplateSeed } from '../../../engine/templates/templateSeed.js';
import { certifyTemplateSeed } from '../../../engine/templates/certifyTemplateSeed.js';

const templateFixture = Object.freeze({
  metadata: {
    id: 'tpl.domain.registry',
    version: '1.0.0',
    name: 'Domain Registry Fixture',
    engine: 'dropple-motion@1.x',
    author: 'Dropple',
    license: 'dropple-marketplace-standard',
    createdAt: '2026-05-01',
    description: 'Certified registry fixture',
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
    triggers: { onLoad: 'intro' },
  },
  params: {
    content: {
      'title.text': { type: 'string', default: 'Hello' },
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

function buildCertifiedSeed(version) {
  const template = clone(templateFixture);
  template.metadata.version = version;
  return compileTemplateV1(template).seed;
}

function buildCertifiedDerivedSeed(baseSeed, version, lineage) {
  return certifyTemplateSeed(
    createTemplateSeed({
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
    }),
  );
}

test('domain template registry stores certified lineage entries append-only with deterministic lineage listing', async () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dropple-domain-registry-'));
  const originalCwd = process.cwd();
  process.chdir(tempDir);

  try {
    const { registerTemplate, loadRegistry, getByVersionId, getLineageRoot, listLineageVersions } =
      await import('../TemplateRegistry.js');

    const root = buildCertifiedSeed('1.0.0');
    const child = buildCertifiedDerivedSeed(root, '1.1.0', {
      type: 'version',
      rootId: root.lineage.rootId,
      parentIds: [root.lineage.nodeId],
    });

    const registeredRoot = registerTemplate({
      template: root,
      engineVersion: root.certification.engineVersion,
    });
    const registeredChild = registerTemplate({
      template: child,
      engineVersion: child.certification.engineVersion,
    });

    assert.equal(registeredRoot.registered, true);
    assert.equal(registeredChild.registered, true);

    const registry = loadRegistry();
    assert.equal(registry.format, 'dropple-certified-template-registry@2');
    assert.equal(registry.entries.length, 2);
    assert.deepEqual(registry.lineageRoots[root.lineage.rootId], [
      root.lineage.nodeId,
      child.lineage.nodeId,
    ]);
    assert.equal(getByVersionId(child.lineage.nodeId)?.version, '1.1.0');
    assert.deepEqual(getLineageRoot(root.lineage.rootId)?.versionIds, [
      root.lineage.nodeId,
      child.lineage.nodeId,
    ]);
    assert.deepEqual(
      listLineageVersions(root.lineage.rootId).map((entry) => entry.version),
      ['1.0.0', '1.1.0'],
    );
  } finally {
    process.chdir(originalCwd);
  }
});

test('domain template registry rejects uncertified, orphaned, and cross-root lineage entries', async () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dropple-domain-registry-'));
  const originalCwd = process.cwd();
  process.chdir(tempDir);

  try {
    const { registerTemplate } = await import('../TemplateRegistry.js');

    const root = buildCertifiedSeed('1.0.0');
    registerTemplate({
      template: root,
      engineVersion: root.certification.engineVersion,
    });

    const uncertified = createTemplateSeed({
      id: root.id,
      version: '1.1.0',
      snapshotHash: root.snapshotHash,
      baseSceneGraph: root.baseSceneGraph,
      states: root.states,
      defaultState: root.defaultState,
      capabilityProfile: root.capabilityProfile,
      metadata: root.metadata,
      params: root.params,
      contentHashInputs: root.contentHashInputs,
      lineage: {
        type: 'version',
        rootId: root.lineage.rootId,
        parentIds: [root.lineage.nodeId],
      },
    });

    assert.throws(
      () =>
        registerTemplate({
          template: uncertified,
          engineVersion: root.certification.engineVersion,
        }),
      /Certified template registry entries require certification|Certification invalid/,
    );

    const orphan = buildCertifiedDerivedSeed(root, '1.1.0', {
      type: 'version',
      rootId: root.lineage.rootId,
      parentIds: ['missing-parent-version'],
    });
    assert.throws(
      () =>
        registerTemplate({
          template: orphan,
          engineVersion: orphan.certification.engineVersion,
        }),
      /Certified template lineage parent missing from registry/,
    );

    const foreignRoot = buildCertifiedDerivedSeed(root, '1.1.0', {
      type: 'version',
      rootId: 'foreign-root-id',
      parentIds: [root.lineage.nodeId],
    });
    assert.throws(
      () =>
        registerTemplate({
          template: foreignRoot,
          engineVersion: foreignRoot.certification.engineVersion,
        }),
      /Certified template lineage root mismatch/,
    );
  } finally {
    process.chdir(originalCwd);
  }
});

console.log('TEMPLATE REGISTRY TESTS: OK');
