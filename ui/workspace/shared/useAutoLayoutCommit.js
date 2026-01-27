import { computeFlexLayout } from '@/ui/layout/computeFlexLayout';
import { computeGridLayout } from '@/ui/layout/computeGridLayout';

export function applyAutoLayoutIfNeeded({ state, emit }) {
  Object.values(state.nodes).forEach((node) => {
    const auto = node.layout.autoLayout;
    if (!auto) return;

    const children = node.children.map((id) => state.nodes[id]).filter(Boolean);
    if (!children.length) return;

    const positions =
      auto.type === 'grid'
        ? computeGridLayout(node, children)
        : computeFlexLayout(node, children);

    positions.forEach(({ nodeId, x, y }) => {
      const child = state.nodes[nodeId];
      if (!child) return;
      if (child.layout.x === x && child.layout.y === y) return;

      emit({
        type: 'node.layout.move',
        payload: { nodeId, x, y },
      });
    });
  });
}
