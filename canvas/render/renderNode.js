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

  if (node.children?.length) {
    for (const childId of node.children) {
      const child = state.nodes[childId];
      if (!child) continue;
      el.appendChild(renderNode(child, state));
    }
  }

  return el;
}
