import { computeAlignmentBounds } from './computeAlignmentBounds.js';

export function alignNodes(nodes = [], alignment) {
  if (!Array.isArray(nodes) || nodes.length < 2) return [];

  const ordered = [...nodes].sort((a, b) =>
    String(a?.id).localeCompare(String(b?.id))
  );

  const bounds = computeAlignmentBounds(ordered);
  if (!bounds) return [];

  return ordered.map((node) => {
    const layout = node?.layout || {};
    const width = layout.width ?? node?.width ?? 0;
    const height = layout.height ?? node?.height ?? 0;
    let x = layout.x ?? node?.x ?? 0;
    let y = layout.y ?? node?.y ?? 0;

    switch (alignment) {
      case 'alignLeft':
        x = bounds.minX;
        break;
      case 'alignRight':
        x = bounds.maxX - width;
        break;
      case 'alignCenterX':
        x = bounds.centerX - width / 2;
        break;
      case 'alignTop':
        y = bounds.minY;
        break;
      case 'alignBottom':
        y = bounds.maxY - height;
        break;
      case 'alignCenterY':
        y = bounds.centerY - height / 2;
        break;
      default:
        break;
    }

    return { id: node.id, x, y };
  });
}
