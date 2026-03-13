import { validateVariantSnapshot } from "../../core/variants/validateVariantSnapshot.js";

export async function generateVariants(
  template,
  variantIntent,
  llm,
  options = {}
) {
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

  const validVariants = [];
  let attempts = 0;

  while (validVariants.length < count && attempts < count * maxRetriesPerVariant) {
    attempts++;

    let aiOutput;

    try {
      aiOutput = await llm.generate({
        system: systemPrompt,
        prompt: "Generate variant parameter snapshots.",
      });
    } catch {
      continue;
    }

    let parsed;

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
        continue;
      }
    }
  }

  return validVariants;
}
