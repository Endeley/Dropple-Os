/**
 * DROPPLE SKELETON v2
 * Spec: §7 Intent & Dispatcher System
 * Authoritative
 */

export type IntentOrigin = "ui" | "ai" | "system"

export interface Intent {
  type: string
  payload: unknown
  origin: IntentOrigin
}
