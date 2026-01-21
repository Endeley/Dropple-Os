import type { LegacyTemplate } from "../legacy/types";
import type { LegacyToCCMResult } from "./types";

export declare function convertLegacyTemplateToCCM(
  legacy: LegacyTemplate,
  options?: {
    strict?: boolean;
    marketplaceSafe?: boolean;
  }
): LegacyToCCMResult;
