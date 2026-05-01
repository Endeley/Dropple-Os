import {
  ArtifactKind,
  createEnvironmentArtifact,
  createSnapshotArtifact,
} from './types.js';

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export function normalizeArtifact(input, { source = 'artifact' } = {}) {
  if (!isPlainObject(input)) {
    throw new Error(`${source}: artifact input must be a plain object`);
  }

  if (input.kind === ArtifactKind.SNAPSHOT) {
    return createSnapshotArtifact({
      snapshot: input.snapshot,
    });
  }

  if (input.kind === ArtifactKind.ENVIRONMENT) {
    return createEnvironmentArtifact({
      snapshot: input.snapshot,
      descriptor: input.descriptor,
      resolvedEnvironment: input.resolvedEnvironment,
    });
  }

  if (input.isEnvironmentBacked === true) {
    console.warn('[Artifact] Legacy artifact normalized', {
      source,
      hasDescriptor: Boolean(input.descriptor),
      hasResolvedEnvironment: Boolean(input.resolvedEnvironment),
    });
    return createEnvironmentArtifact({
      snapshot: input.snapshot,
      descriptor: input.descriptor,
      resolvedEnvironment: input.resolvedEnvironment,
    });
  }

  console.warn('[Artifact] Legacy artifact normalized', {
    source,
    hasDescriptor: Boolean(input.descriptor),
    hasResolvedEnvironment: Boolean(input.resolvedEnvironment),
  });
  return createSnapshotArtifact({
    snapshot: input.snapshot,
  });
}
