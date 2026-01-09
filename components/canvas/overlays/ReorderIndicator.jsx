import { colors, motion } from '@/ui/tokens';

export function ReorderIndicator({ parent, nodes, toIndex, active }) {
  if (toIndex == null) return null;

  const children = parent.children.map((id) => nodes[id]).filter(Boolean);
  const target = children[toIndex];

  if (!target) return null;

  return (
    <div
      style={{
        position: 'absolute',
        left: target.layout.x - 2,
        top: target.layout.y,
        width: 4,
        height: target.layout.height,
        background: colors.primary,
        opacity: active ? 1 : 0,
        transition: `opacity ${motion.fast}`,
        zIndex: 4,
        pointerEvents: 'none',
      }}
    />
  );
}
