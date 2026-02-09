/**
 * DROPPLE SKELETON v2
 * Spec: §5 Node Model (Canonical)
 * Authoritative
 */

import { WorldTransform } from "./transform"

export interface NodeMeta {
  createdAt: number
  updatedAt: number
  createdBy: string
}

export interface Node {
  id: string
  type: string // NodeType is an open set — MUST NOT be hardcoded
  transform: WorldTransform
  props: Record<string, unknown>
  meta: NodeMeta
}
