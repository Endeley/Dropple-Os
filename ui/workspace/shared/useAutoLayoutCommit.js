import { computeFlexLayout } from '@/ui/layout/computeFlexLayout';
import { computeGridLayout } from '@/ui/layout/computeGridLayout';
import { getNodes } from '@/runtime/document/documentAdapter';

export function applyAutoLayoutIfNeeded({ state, emit }) {
  if (process.env.NODE_ENV !== 'production' && emit) {
    console.warn(
      '[applyAutoLayoutIfNeeded] This helper is now pure. Emitting layout moves is disabled.'
    );
  }

  const positions = {};
  const nodes = getNodes(state);

  Object.values(nodes).forEach((node) => {
    const auto = node.layout.autoLayout;
    if (!auto) return;

    const children = node.children.map((id) => nodes[id]).filter(Boolean);
    if (!children.length) return;

    const computedPositions =
      auto.type === 'grid'
        ? computeGridLayout(node, children)
        : computeFlexLayout(node, children);

    computedPositions.forEach(({ nodeId, x, y }) => {
      const child = nodes[nodeId];
      if (!child) return;
      if (child.layout.x === x && child.layout.y === y) return;
      positions[nodeId] = { x, y };
    });
  });

  return positions;
}
