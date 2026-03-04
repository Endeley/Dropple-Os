import { computeFlexLayout } from '@/ui/layout/computeFlexLayout';
import { computeGridLayout } from '@/ui/layout/computeGridLayout';

export function applyAutoLayoutIfNeeded({ state, emit }) {
  if (process.env.NODE_ENV !== 'production' && emit) {
    console.warn(
      '[applyAutoLayoutIfNeeded] This helper is now pure. Emitting layout moves is disabled.'
    );
  }

  const positions = {};

  Object.values(state.nodes).forEach((node) => {
    const auto = node.layout.autoLayout;
    if (!auto) return;

    const children = node.children.map((id) => state.nodes[id]).filter(Boolean);
    if (!children.length) return;

    const computedPositions =
      auto.type === 'grid'
        ? computeGridLayout(node, children)
        : computeFlexLayout(node, children);

    computedPositions.forEach(({ nodeId, x, y }) => {
      const child = state.nodes[nodeId];
      if (!child) return;
      if (child.layout.x === x && child.layout.y === y) return;
      positions[nodeId] = { x, y };
    });
  });

  return positions;
}
