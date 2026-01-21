/**
 * LegacyTemplateConverter
 *
 * DESIGN-ONLY CONTRACT.
 * No implementation is allowed until explicitly approved.
 *
 * Purpose:
 * Define the ONLY allowed shape of a legacy -> CCM migration.
 */

import type { TemplateArtifactV1 } from "../types";

/* ----------------------------- */
/* Legacy input types (minimal)  */
/* ----------------------------- */

export type LegacyTemplate = {
  id: string;
  mode: string;

  baseSnapshot?: unknown;
  eventTimeline?: unknown[];

  metadata?: {
    title?: string;
    description?: string;
    [key: string]: unknown;
  };

  // Explicit escape hatch for unknown legacy data
  [key: string]: unknown;
};

/* ----------------------------- */
/* Migration outcome             */
/* ----------------------------- */

export type ConversionResult =
  | {
      ok: true;
      artifact: TemplateArtifactV1;
      warnings?: ConversionWarning[];
    }
  | {
      ok: false;
      reason: ConversionFailureReason;
      details?: string;
    };

export type ConversionWarning = {
  code: string;
  message: string;
};

/* ----------------------------- */
/* Failure reasons (locked)      */
/* ----------------------------- */

export type ConversionFailureReason =
  | "NON_DETERMINISTIC_BEHAVIOR"
  | "INTERACTIONS_PRESENT"
  | "RUNTIME_LAYOUT_MUTATION"
  | "UNSUPPORTED_MOTION"
  | "STRUCTURE_INVALID"
  | "AMBIGUOUS_PARAMS"
  | "EDITOR_ONLY_CONSTRUCTS"
  | "UNKNOWN_LEGACY_FEATURE";

/* ----------------------------- */
/* Converter interface           */
/* ----------------------------- */

export interface LegacyTemplateConverter {
  /**
   * Quick eligibility check.
   *
   * Must be:
   * - fast
   * - side-effect free
   * - conservative (false negatives allowed)
   */
  canConvert(template: LegacyTemplate): boolean;

  /**
   * Performs a one-way conversion attempt.
   *
   * Rules:
   * - MUST NOT mutate the input template
   * - MUST NOT generate editor state
   * - MUST NOT bypass CCM validation
   * - MUST return explicit failure reasons
   */
  convert(template: LegacyTemplate): ConversionResult;

  /**
   * Optional: explain why a template cannot be converted.
   *
   * Used for UI / audit / developer feedback only.
   */
  explainFailure?(
    template: LegacyTemplate
  ): {
    reason: ConversionFailureReason;
    explanation: string;
  };
}
