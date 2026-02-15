// 🔒 Canonical node factory lives at `@/core/nodes/createNode`.
// This module now exposes scene-specific helpers only.
import { createNode } from '@/core/nodes/createNode';

export function buildSceneNode({ id, type, children, ...rest }) {
  return createNode({ id, type, children, ...rest });
}
