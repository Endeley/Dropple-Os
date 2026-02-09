/**
 * DROPPLE SKELETON v2
 * Spec: §10 History & Time Semantics
 * Non-authoritative — MUST NOT be exported
 */

import { Intent } from "./intent"

export interface HistoryEntry {
  intent: Intent
  before: unknown
  after: unknown
  timestamp: number
}
