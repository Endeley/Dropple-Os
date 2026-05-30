function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export const ArtifactKind = Object.freeze({
  SNAPSHOT: 'snapshot',
  ENVIRONMENT: 'environment',
  PROJECT_HUB: 'project-hub',
  FRAME: 'frame',
  DOCUMENT: 'document',
  VIDEO: 'video',
  ANIMATION: 'animation',
  WORKFLOW: 'workflow',
  STATE_MACHINE: 'state-machine',
  KNOWLEDGE_PAGE: 'knowledge-page',
  COMPONENT_LIBRARY: 'component-library',
  AI_AGENT: 'ai-agent',
  SYSTEM_MODEL: 'system-model',
});

export function isEnvironmentArtifact(artifact) {
  return isPlainObject(artifact) && artifact.kind === ArtifactKind.ENVIRONMENT;
}

export function isSnapshotArtifact(artifact) {
  return isPlainObject(artifact) && artifact.kind === ArtifactKind.SNAPSHOT;
}

export function isProjectHubArtifact(artifact) {
  return isPlainObject(artifact) && artifact.kind === ArtifactKind.PROJECT_HUB;
}
