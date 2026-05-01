function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

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

export const ArtifactKind = Object.freeze({
  SNAPSHOT: 'snapshot',
  ENVIRONMENT: 'environment',
});

export function createSnapshotArtifact({ snapshot } = {}) {
  if (!isPlainObject(snapshot)) {
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
  if (!isPlainObject(snapshot) || !isPlainObject(descriptor) || !isPlainObject(resolvedEnvironment)) {
    throw new Error('EnvironmentArtifact requires snapshot + descriptor + resolvedEnvironment');
  }

  return deepFreeze({
    kind: ArtifactKind.ENVIRONMENT,
    snapshot,
    descriptor,
    resolvedEnvironment,
  });
}

export function isEnvironmentArtifact(artifact) {
  return artifact?.kind === ArtifactKind.ENVIRONMENT;
}

export function isSnapshotArtifact(artifact) {
  return artifact?.kind === ArtifactKind.SNAPSHOT;
}

