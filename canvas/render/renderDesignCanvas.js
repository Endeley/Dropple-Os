import { renderNode } from './renderNode.js';

export function renderDesignCanvas({
  state,
  container,
}) {
  // Some headless runtime paths invoke frame rendering without a DOM container.
  if (!container || typeof container.appendChild !== 'function') {
    return;
  }

  if (!state || !state.nodes || !Array.isArray(state.rootIds)) {
    return;
  }

  container.innerHTML = '';

  for (const rootId of state.rootIds) {
    const node = state.nodes[rootId];
    if (!node) continue;

    const el = renderNode(node, state);
    container.appendChild(el);
  }
}
