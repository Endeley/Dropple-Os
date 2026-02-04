import { nanoid } from 'nanoid';
import { canvasBus } from '@/ui/canvasBus';

export function pasteFromClipboard({ clipboard, offset = 20 }) {
  if (!clipboard) return [];

  const idMap = new Map();
  const newIds = [];

  clipboard.nodes.forEach((node) => {
    const newId = nanoid();
    idMap.set(node.id, newId);
    newIds.push(newId);
  });

  clipboard.nodes.forEach((node) => {
    const newId = idMap.get(node.id);
    if (!newId) return;
    canvasBus.emit('intent.node.create', {
      id: newId,
      type: node.type,
      parentId: node.parentId ? idMap.get(node.parentId) || null : null,
      props: node.props,
      style: node.style,
      content: node.content,
      bounds: {
        x: node.layout.x + offset,
        y: node.layout.y + offset,
        width: node.layout.width,
        height: node.layout.height,
      },
    });
  });

  return newIds;
}
