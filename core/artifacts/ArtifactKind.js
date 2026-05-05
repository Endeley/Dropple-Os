function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export const ArtifactKind = Object.freeze({
  SNAPSHOT: 'snapshot',
  ENVIRONMENT: 'environment',
});

export function isEnvironmentArtifact(artifact) {
  return isPlainObject(artifact) && artifact.kind === ArtifactKind.ENVIRONMENT;
}

export function isSnapshotArtifact(artifact) {
  return isPlainObject(artifact) && artifact.kind === ArtifactKind.SNAPSHOT;
}
