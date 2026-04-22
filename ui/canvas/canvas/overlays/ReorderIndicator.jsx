import { useToken } from '@/ui/hooks/useToken.js';

export function ReorderIndicator({ parent, nodes, toIndex, active }) {
  const primary = useToken('color.primary');
  const motionFast = useToken('motion.fast');
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
        background: primary,
        opacity: active ? 1 : 0,
        transition: `opacity ${motionFast}`,
        zIndex: 4,
        pointerEvents: 'none',
      }}
    />
  );
}
