/**
 * DROPPLE SKELETON v2
 * Spec: §6 Node Graph & Relationships
 * Authoritative
 */

export type EdgeType = "parent" | "reference" | "flow"

export interface Edge {
  from: string
  to: string
  type: EdgeType
}
