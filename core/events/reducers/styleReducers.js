// core/events/reducers/styleReducers.js

export function styleReducers(state, event) {
  if (event?.type !== 'node.style.update') return state;

  const { nodeId, style } = event.payload || {};
  const node = state.nodes?.[nodeId];
  if (!node) return state;

  return {
    ...state,
    nodes: {
      ...state.nodes,
      [nodeId]: {
        ...node,
        style: {
          ...(node.style || {}),
          ...(style || {}),
        },
      },
    },
  };
}
