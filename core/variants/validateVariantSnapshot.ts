import { TemplateArtifactV1, ParamDefinition } from "../ccm/types";

export class VariantValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "VariantValidationError";
  }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Validates a param-only variant snapshot against a trusted CCM v1 template.
 *
 * A variant snapshot may ONLY:
 * - reference an existing template (id + version)
 * - provide VALUES for existing params
 *
 * It may NEVER:
 * - introduce new params
 * - redefine param schemas
 * - touch structure, motion, or runtime
 */
export function validateVariantSnapshot(
  variantSnapshot: unknown,
  template: TemplateArtifactV1
): { ok: true } {
  // STEP 0 — Input sanity
  if (!isPlainObject(variantSnapshot)) {
    throw new VariantValidationError(
      "Variant snapshot must be a plain object"
    );
  }

  // STEP 1 — Top-level shape
  const allowedKeys = ["templateRef", "params"];
  const actualKeys = Object.keys(variantSnapshot);

  if (actualKeys.length !== allowedKeys.length) {
    throw new VariantValidationError(
      "Variant snapshot must contain exactly templateRef and params"
    );
  }

  for (const key of allowedKeys) {
    if (!(key in variantSnapshot)) {
      throw new VariantValidationError(`Missing variant key: ${key}`);
    }
  }

  for (const key of actualKeys) {
    if (!allowedKeys.includes(key)) {
      throw new VariantValidationError(`Unknown variant key: ${key}`);
    }
  }

  // STEP 2 — Template reference validation
  const templateRef = (variantSnapshot as any).templateRef;

  if (!isPlainObject(templateRef)) {
    throw new VariantValidationError("templateRef must be an object");
  }

  if (templateRef.id !== template.metadata.id) {
    throw new VariantValidationError(
      "Variant template id does not match template"
    );
  }

  if (templateRef.version !== template.metadata.version) {
    throw new VariantValidationError(
      "Variant template version does not match template"
    );
  }

  // STEP 3 — Params object validation
  const variantParams = (variantSnapshot as any).params;

  if (!isPlainObject(variantParams)) {
    throw new VariantValidationError("variant params must be an object");
  }

  // STEP 4 — Build allowed param map from template
  const allowedParams: Record<string, ParamDefinition> = {};

  for (const group of ["content", "style", "motion"] as const) {
    const groupParams = template.params[group];
    if (!groupParams) continue;

    for (const paramKey of Object.keys(groupParams)) {
      allowedParams[paramKey] = groupParams[paramKey];
    }
  }

  // STEP 5 — Validate each variant param key
  for (const paramKey of Object.keys(variantParams)) {
    if (!(paramKey in allowedParams)) {
      throw new VariantValidationError(
        `Variant references unknown param: ${paramKey}`
      );
    }
  }

  // STEP 6 — Validate each param value
  for (const paramKey of Object.keys(variantParams)) {
    const value = variantParams[paramKey];
    const paramDef = allowedParams[paramKey];

    // 6.1 Isolation: no objects or arrays
    if (isPlainObject(value) || Array.isArray(value)) {
      throw new VariantValidationError(
        `Variant param '${paramKey}' must be a primitive value`
      );
    }

    switch (paramDef.type) {
      case "string":
        if (typeof value !== "string") {
          throw new VariantValidationError(
            `Param '${paramKey}' must be a string`
          );
        }
        break;

      case "number":
        if (typeof value !== "number") {
          throw new VariantValidationError(
            `Param '${paramKey}' must be a number`
          );
        }
        break;

      case "enum":
      case "preset":
      case "token":
        if (!paramDef.values || !paramDef.values.includes(value)) {
          throw new VariantValidationError(
            `Param '${paramKey}' value is not in allowed values`
          );
        }
        break;

      case "asset":
        // Asset validation is intentionally minimal here
        // (existence, shape, etc. handled elsewhere)
        if (typeof value !== "string") {
          throw new VariantValidationError(
            `Param '${paramKey}' must be an asset reference string`
          );
        }
        break;

      default:
        throw new VariantValidationError(
          `Unknown param type for '${paramKey}'`
        );
    }
  }

  // STEP 7 — Must change at least one param
  if (Object.keys(variantParams).length === 0) {
    throw new VariantValidationError(
      "Variant must modify at least one param"
    );
  }

  return { ok: true };
}
