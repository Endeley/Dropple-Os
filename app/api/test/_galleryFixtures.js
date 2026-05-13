import { loadRegistryEntries } from '@/domain/templates/TemplateRegistry.js';
import { buildDescriptorFromCertifiedTemplate } from '@/domain/templates/buildDescriptorFromCertifiedTemplate.js';
import { resolveTemplateEnvironment } from '@/domain/templates/resolveTemplateEnvironment.js';
import { createLocalDocumentSnapshot } from '@/infrastructure/persistence/localDocumentSchema.js';
import {
  createEnvironmentArtifact,
  createSnapshotArtifact,
} from '@/gallery/artifacts/types.js';
import { createTestGalleryFixture } from '@/gallery/testGalleryFixtureStore.js';

function assertTestFixtureAccess() {
  if (
    process.env.DROPPLE_E2E === '1' ||
    process.env.NEXT_DIST_DIR === '.next-e2e' ||
    process.env.NODE_ENV !== 'production'
  ) {
    return;
  }

  throw new Error('Test gallery fixtures are disabled outside test/dev environments.');
}

function selectCertifiedFixtureTemplate() {
  const entries = loadRegistryEntries();
  const template =
    entries.find((entry) => entry.workspaceId === 'design') ??
    entries[0] ??
    null;

  if (!template) {
    throw new Error('No certified template is available for gallery fixture creation.');
  }

  return template;
}

export async function createEnvironmentBackedGalleryFixture() {
  assertTestFixtureAccess();

  const template = selectCertifiedFixtureTemplate();
  const descriptor = buildDescriptorFromCertifiedTemplate(template);
  const resolvedEnvironment = resolveTemplateEnvironment(descriptor);
  const modeId =
    resolvedEnvironment?.resolvedEnvironment?.modeContext?.modeId ?? 'graphic';

  const snapshot = createLocalDocumentSnapshot({
    events: [],
    cursorIndex: -1,
    metadata: {
      mode: modeId,
      source: 'environment-fixture',
    },
  });

  const artifact = createEnvironmentArtifact({
    snapshot,
    descriptor,
    resolvedEnvironment,
  });

  return createTestGalleryFixture({
    artifact,
    title: 'Environment Fixture',
    description: 'Deterministic environment-backed gallery fixture',
    tags: ['fixture', 'environment'],
    mode: modeId,
  });
}

export async function createSnapshotBackedGalleryFixture() {
  assertTestFixtureAccess();

  const snapshot = createLocalDocumentSnapshot({
    events: [],
    cursorIndex: -1,
    metadata: {
      mode: 'graphic',
      source: 'snapshot-fixture',
    },
  });

  const artifact = createSnapshotArtifact({
    snapshot,
  });

  return createTestGalleryFixture({
    artifact,
    title: 'Snapshot Fixture',
    description: 'Deterministic snapshot-backed gallery fixture',
    tags: ['fixture', 'snapshot'],
    mode: 'graphic',
  });
}
