import { renderNode } from './renderNode.js';

export function renderDesignCanvas({
  state,
  container,
}) {
  container.innerHTML = '';

  for (const rootId of state.rootIds) {
    const node = state.nodes[rootId];
    if (!node) continue;

    const el = renderNode(node, state);
    container.appendChild(el);
  }
}
