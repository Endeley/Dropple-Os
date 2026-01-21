import type { TemplateArtifactV1 } from "@/core/ccm/types";

export type LegacyToCCMWarning =
  | {
      code: "ANIMATION_SIMPLIFIED";
      message: string;
    }
  | {
      code: "STYLE_FLATTENED";
      message: string;
    }
  | {
      code: "DEFAULTS_APPLIED";
      message: string;
    };

export type LegacyToCCMError =
  | {
      code: "UNSUPPORTED_EVENT";
      message: string;
      eventType: string;
    }
  | {
      code: "NON_DETERMINISTIC_LAYOUT";
      message: string;
    }
  | {
      code: "INTERACTIONS_NOT_SUPPORTED";
      message: string;
    }
  | {
      code: "DYNAMIC_RUNTIME_DEPENDENCY";
      message: string;
    }
  | {
      code: "VALIDATION_FAILED";
      message: string;
      validationErrors: string[];
    }
  | {
      code: "UNKNOWN";
      message: string;
    };

export type LegacyToCCMResult =
  | {
      ok: true;
      artifact: TemplateArtifactV1;
      warnings?: LegacyToCCMWarning[];
    }
  | {
      ok: false;
      error: LegacyToCCMError;
    };
