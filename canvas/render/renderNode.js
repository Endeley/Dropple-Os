import { applyStyle } from './style/applyStyle.js';
import { applyLayout } from './layout/applyLayout.js';
import { renderText } from './types/renderText.js';
import { renderImage } from './types/renderImage.js';

export function renderNode(node, state) {
  let el;

  switch (node.type) {
    case 'text':
      el = renderText(node);
      break;

    case 'image':
      el = renderImage(node);
      break;

    case 'frame':
    case 'container':
    case 'shape':
    default:
      el = document.createElement('div');
      break;
  }

  el.dataset.nodeId = node.id;

  applyLayout(el, node.layout);
  applyStyle(el, node.style);

  if (!node.screen) {
    console.warn('[renderNode] Missing screen coords for node', node.id);
  } else {
    const x = node.screen?.x ?? 0;
    const y = node.screen?.y ?? 0;
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
  }

  if (node.previewBoundsScreen) {
    const b = node.previewBoundsScreen;
    el.style.left = `${b.x}px`;
    el.style.top = `${b.y}px`;
    el.style.width = `${b.width}px`;
    el.style.height = `${b.height}px`;
  }

  const dx = node.previewTransform?.dx || 0;
  const dy = node.previewTransform?.dy || 0;
  if (dx !== 0 || dy !== 0) {
    const existing = el.style.transform ? ` ${el.style.transform}` : '';
    el.style.transform = `translate(${dx}px, ${dy}px)${existing}`;
  }

  if (node.children?.length) {
    for (const childId of node.children) {
      const child = state.nodes[childId];
      if (!child) continue;
      el.appendChild(renderNode(child, state));
    }
  }

  return el;
}
