export function nodeLayoutReducer(state, event) {
  const next = structuredClone(state);

  const { nodeId } = event.payload;
  const node = next.nodes[nodeId];
  if (!node) return state;

  if (event.type === 'node.layout.move') {
    const { x, y } = event.payload;
    node.layout = {
      ...node.layout,
      x,
      y,
    };
  } else if (event.type === 'node.layout.resize') {
    const { width, height } = event.payload;
    node.layout = {
      ...node.layout,
      width,
      height,
    };
  } else if (event.type === 'node.layout.setConstraint') {
    const { constraint } = event.payload;
    node.layout = {
      ...node.layout,
      constraints: {
        ...(node.layout.constraints || {}),
        ...constraint,
      },
    };
  } else if (event.type === 'node.layout.clearConstraint') {
    const { key } = event.payload;
    const { [key]: _, ...rest } = node.layout.constraints || {};
    node.layout = {
      ...node.layout,
      constraints: rest,
    };
  } else if (event.type === 'node.layout.setAutoLayout') {
    const { config } = event.payload;
    if (config.type === 'grid') {
      node.layout = {
        ...node.layout,
        autoLayout: {
          type: 'grid',
          columns: 3,
          rows: 'auto',
          gap: 8,
          padding: 8,
          align: 'start',
          justify: 'start',
          ...config,
        },
      };
    } else {
      node.layout = {
        ...node.layout,
        autoLayout: {
          type: 'flex',
          direction: 'row',
          gap: 8,
          padding: 8,
          align: 'start',
          justify: 'start',
          ...config,
        },
      };
    }
  } else if (event.type === 'node.layout.clearAutoLayout') {
    node.layout = {
      ...node.layout,
      autoLayout: null,
    };
  } else {
    const { layout } = event.payload;
    node.layout = {
      ...node.layout,
      ...layout,
    };
  }

  return next;
}
