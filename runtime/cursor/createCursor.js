export function createCursor({
  runId,
  eventId = null,
  mode = 'replay',
  authority = 'observer',
}) {
  return {
    runId,
    eventId,
    mode,
    authority,
  };
}
