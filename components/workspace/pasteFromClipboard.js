import { nanoid } from 'nanoid';

export function pasteFromClipboard({ clipboard, emit, offset = 20 }) {
  if (!clipboard) return [];

  const idMap = new Map();
  const newIds = [];

  clipboard.nodes.forEach((node) => {
    const newId = nanoid();
    idMap.set(node.id, newId);

    emit({
      type: 'node.create',
      payload: {
        nodeId: newId,
        nodeType: node.type,
        parentId: node.parentId ? idMap.get(node.parentId) || null : null,
        initialProps: node.props,
      },
    });

    newIds.push(newId);
  });

  clipboard.nodes.forEach((node) => {
    const newId = idMap.get(node.id);

    emit({
      type: 'node.layout.move',
      payload: {
        nodeId: newId,
        x: node.layout.x + offset,
        y: node.layout.y + offset,
      },
    });

    emit({
      type: 'node.layout.resize',
      payload: {
        nodeId: newId,
        width: node.layout.width,
        height: node.layout.height,
      },
    });
  });

  return newIds;
}
