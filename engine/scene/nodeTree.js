// 🔒 Canonical node factory lives at `@/core/nodes/createNode`.
import { createNode } from '@/core/nodes/createNode';

export function buildNodeTreeEntry({ id, type }) {
  return createNode({ id, type, children: [] });
}
