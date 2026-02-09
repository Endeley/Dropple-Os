/**
 * DROPPLE SKELETON v2
 * Spec: §2 World & Coordinate System, §5 Node Model
 * Authoritative
 */

export interface WorldPosition {
  x: number
  y: number
}

/**
 * WorldTransform
 * Canonical world-space transform for nodes.
 * MUST use deterministic floating-point values.
 */
export interface WorldTransform {
  position: WorldPosition
  rotation: number
  scale: number
}
