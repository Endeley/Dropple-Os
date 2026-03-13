export class VariantValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "VariantValidationError";
  }
}

function isPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function validateVariantSnapshot(variantSnapshot, template) {
  if (!isPlainObject(variantSnapshot)) {
    throw new VariantValidationError("Variant snapshot must be a plain object");
  }

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

  const templateRef = variantSnapshot.templateRef;
  if (!isPlainObject(templateRef)) {
    throw new VariantValidationError("templateRef must be an object");
  }

  if (templateRef.id !== template.metadata.id) {
    throw new VariantValidationError("Variant template id does not match template");
  }

  if (templateRef.version !== template.metadata.version) {
    throw new VariantValidationError("Variant template version does not match template");
  }

  const variantParams = variantSnapshot.params;
  if (!isPlainObject(variantParams)) {
    throw new VariantValidationError("variant params must be an object");
  }

  const allowedParams = {};
  for (const group of ["content", "style", "motion"]) {
    const groupParams = template.params[group];
    if (!groupParams) continue;
    for (const paramKey of Object.keys(groupParams)) {
      allowedParams[paramKey] = groupParams[paramKey];
    }
  }

  for (const paramKey of Object.keys(variantParams)) {
    if (!(paramKey in allowedParams)) {
      throw new VariantValidationError(`Variant references unknown param: ${paramKey}`);
    }
  }

  for (const paramKey of Object.keys(variantParams)) {
    const value = variantParams[paramKey];
    const paramDef = allowedParams[paramKey];

    if (isPlainObject(value) || Array.isArray(value)) {
      throw new VariantValidationError(
        `Variant param '${paramKey}' must be a primitive value`
      );
    }

    switch (paramDef.type) {
      case "string":
        if (typeof value !== "string") {
          throw new VariantValidationError(`Param '${paramKey}' must be a string`);
        }
        break;
      case "number":
        if (typeof value !== "number") {
          throw new VariantValidationError(`Param '${paramKey}' must be a number`);
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
        if (typeof value !== "string") {
          throw new VariantValidationError(
            `Param '${paramKey}' must be an asset reference string`
          );
        }
        break;
      default:
        throw new VariantValidationError(`Unknown param type for '${paramKey}'`);
    }
  }

  if (Object.keys(variantParams).length === 0) {
    throw new VariantValidationError("Variant must modify at least one param");
  }

  return { ok: true };
}
