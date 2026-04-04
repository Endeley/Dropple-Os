// core/events/reducers/styleReducers.js

export function styleReducers(state, event) {
  if (event?.type !== 'node.style.update') return state;

  const { nodeId, style } = event.payload || {};
  const graph = state?.document?.sceneGraph ?? null;
  const node = graph?.nodes?.[nodeId];
  if (!node) return state;

  return {
    ...state,
    document: {
      ...state.document,
      sceneGraph: {
        ...graph,
        nodes: {
          ...graph.nodes,
          [nodeId]: {
            ...node,
            style: {
              ...(node.style || {}),
              ...(style || {}),
            },
          },
        },
      },
    },
  };
}
