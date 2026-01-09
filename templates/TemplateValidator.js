export function validateTemplate({ snapshot, events }) {
  const errors = [];

  if (!snapshot?.nodes || !Object.keys(snapshot.nodes).length) {
    errors.push('Template must contain at least one node.');
  }

  const hasEducationEvents = events.some((e) =>
    e.type?.startsWith('education.')
  );

  if (hasEducationEvents) {
    errors.push('Education events cannot be included in templates.');
  }

  return errors;
}
