/**
 * DROPPLE SKELETON v2
 * Spec: §11 Export & Specification Contract
 * Authoritative Export Format
 */

import { WorldState } from "./world"
import { Node } from "./node"
import { Edge } from "./edge"
import { Mode } from "./mode"

export interface DroppleSpec {
  version: string
  world: WorldState
  nodes: Node[]
  edges: Edge[]
  modes: Mode[]
  metadata: Record<string, unknown>
}
