export function serializeWorkspaceForTemplate({
  state,
  events,
  startCursor = -1,
}) {
  const snapshot = structuredClone(state);
  const sliced =
    typeof startCursor === 'number' && startCursor >= 0
      ? events.slice(0, startCursor + 1)
      : events;

  return { snapshot, events: sliced };
}
