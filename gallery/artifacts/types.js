import {
  ArtifactKind,
  isEnvironmentArtifact,
  isSnapshotArtifact,
} from '@/core/artifacts/ArtifactKind.js';

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) {
    return value;
  }

  Object.freeze(value);

  if (Array.isArray(value)) {
    value.forEach((item) => deepFreeze(item));
    return value;
  }

  Object.values(value).forEach((item) => deepFreeze(item));
  return value;
}

export function createSnapshotArtifact({ snapshot } = {}) {
  if (!snapshot || typeof snapshot !== 'object' || Array.isArray(snapshot)) {
    throw new Error('SnapshotArtifact requires snapshot');
  }

  return deepFreeze({
    kind: ArtifactKind.SNAPSHOT,
    snapshot,
  });
}

export function createEnvironmentArtifact({
  snapshot,
  descriptor,
  resolvedEnvironment,
} = {}) {
  if (
    !snapshot || typeof snapshot !== 'object' || Array.isArray(snapshot) ||
    !descriptor || typeof descriptor !== 'object' || Array.isArray(descriptor) ||
    !resolvedEnvironment || typeof resolvedEnvironment !== 'object' || Array.isArray(resolvedEnvironment)
  ) {
    throw new Error('EnvironmentArtifact requires snapshot + descriptor + resolvedEnvironment');
  }

  return deepFreeze({
    kind: ArtifactKind.ENVIRONMENT,
    snapshot,
    descriptor,
    resolvedEnvironment,
  });
}
export { ArtifactKind, isEnvironmentArtifact, isSnapshotArtifact };
