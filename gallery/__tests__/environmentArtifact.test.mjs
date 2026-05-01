import test from 'node:test';
import assert from 'node:assert/strict';

import {
  ArtifactKind,
  createEnvironmentArtifact,
  createSnapshotArtifact,
  isEnvironmentArtifact,
  isSnapshotArtifact,
} from '../artifacts/types.js';
import { normalizeArtifact } from '../artifacts/normalizeArtifact.js';

test('createSnapshotArtifact returns a closed snapshot artifact', () => {
  const artifact = createSnapshotArtifact({
    snapshot: { version: 1, events: [], cursorIndex: -1, metadata: {} },
  });

  assert.equal(artifact.kind, ArtifactKind.SNAPSHOT);
  assert.equal(isSnapshotArtifact(artifact), true);
  assert.equal(isEnvironmentArtifact(artifact), false);
  assert.equal(Object.isFrozen(artifact), true);
});

test('createEnvironmentArtifact returns a closed environment artifact', () => {
  const artifact = createEnvironmentArtifact({
    snapshot: { version: 1, events: [], cursorIndex: -1, metadata: {} },
    descriptor: { environmentId: 'env-1' },
    resolvedEnvironment: { resolvedEnvironment: { modeContext: { workspaceId: 'design', modeId: 'graphic' } } },
  });

  assert.equal(artifact.kind, ArtifactKind.ENVIRONMENT);
  assert.equal(isEnvironmentArtifact(artifact), true);
  assert.equal(isSnapshotArtifact(artifact), false);
  assert.equal(Object.isFrozen(artifact), true);
});

test('artifact constructors reject partial shapes', () => {
  assert.throws(
    () =>
      createSnapshotArtifact({
        snapshot: null,
      }),
    /SnapshotArtifact requires snapshot/,
  );

  assert.throws(
    () =>
      createEnvironmentArtifact({
        snapshot: { version: 1, events: [], cursorIndex: -1, metadata: {} },
        descriptor: null,
        resolvedEnvironment: { resolvedEnvironment: { modeContext: { workspaceId: 'design', modeId: 'graphic' } } },
      }),
    /EnvironmentArtifact requires snapshot \+ descriptor \+ resolvedEnvironment/,
  );
});

test('normalizeArtifact preserves typed artifacts and upgrades legacy environment shapes', () => {
  const typedSnapshot = normalizeArtifact({
    kind: ArtifactKind.SNAPSHOT,
    snapshot: { version: 1, events: [], cursorIndex: -1, metadata: {} },
  }, { source: 'typed snapshot' });

  assert.equal(typedSnapshot.kind, ArtifactKind.SNAPSHOT);

  const legacyEnvironment = normalizeArtifact({
    snapshot: { version: 1, events: [], cursorIndex: -1, metadata: {} },
    isEnvironmentBacked: true,
    descriptor: { environmentId: 'env-1' },
    resolvedEnvironment: { resolvedEnvironment: { modeContext: { workspaceId: 'design', modeId: 'graphic' } } },
  }, { source: 'legacy environment' });

  assert.equal(legacyEnvironment.kind, ArtifactKind.ENVIRONMENT);
});
