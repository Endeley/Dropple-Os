export function getEducationAtCursor(state, cursor) {
  const edu = state.education || {};
  const index = cursor?.index ?? -1;

  return {
    annotations: (edu.annotations || []).filter((a) => a.time <= index),
    explanations: (edu.explanations || []).filter((e) => e.time <= index),
  };
}
