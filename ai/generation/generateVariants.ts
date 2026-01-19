import { validateVariantSnapshot } from "../../core/variants/validateVariantSnapshot";
import { TemplateArtifactV1 } from "../../core/ccm/types";

export type LLM = {
  generate(input: {
    system: string;
    prompt: string;
  }): Promise<string>;
};

export type GenerateVariantsOptions = {
  count?: number;
  maxRetriesPerVariant?: number;
};

/**
 * Generates param-only variants for a trusted CCM v1 template.
 * Variants are validated individually and invalid ones are retried or discarded.
 */
export async function generateVariants(
  template: TemplateArtifactV1,
  variantIntent: string,
  llm: LLM,
  options: GenerateVariantsOptions = {}
): Promise<Array<{ templateRef: { id: string; version: string }; params: Record<string, unknown> }>> {
  const count = options.count ?? 3;
  const maxRetriesPerVariant = options.maxRetriesPerVariant ?? 2;

  const systemPrompt = `
You are generating PARAM-ONLY VARIANTS for an existing CCM v1 template.

You MUST:
- Output JSON only
- Output an array of variant objects
- Each variant MUST have exactly:
  - templateRef { id, version }
  - params (values only)

You MUST NOT:
- Modify structure, motion, or runtime
- Introduce new param keys
- Redefine param schemas
- Output comments or explanations

Template ID: ${template.metadata.id}
Template Version: ${template.metadata.version}

Variant intent:
${variantIntent}
`;

  const validVariants: Array<{
    templateRef: { id: string; version: string };
    params: Record<string, unknown>;
  }> = [];

  let attempts = 0;

  while (validVariants.length < count && attempts < count * maxRetriesPerVariant) {
    attempts++;

    let aiOutput: string;

    try {
      aiOutput = await llm.generate({
        system: systemPrompt,
        prompt: "Generate variant parameter snapshots.",
      });
    } catch {
      continue;
    }

    let parsed: unknown;

    try {
      parsed = JSON.parse(aiOutput);
    } catch {
      continue;
    }

    if (!Array.isArray(parsed)) {
      continue;
    }

    for (const variant of parsed) {
      try {
        validateVariantSnapshot(variant, template);
        validVariants.push(variant);

        if (validVariants.length >= count) {
          break;
        }
      } catch {
        // Invalid variants are silently discarded
        continue;
      }
    }
  }

  return validVariants;
}
