export function createTemplateArtifact({ id, mode, snapshot, events, metadata }) {
  return {
    id,
    mode,
    snapshot,
    events,
    metadata,
  };
}
