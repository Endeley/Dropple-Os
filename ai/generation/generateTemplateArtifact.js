import { ccmAuthorPrompt } from "../prompts/ccmAuthorPrompt.js";
import { validateTemplateArtifact } from "../../core/ccm/validate/validateTemplateArtifact.js";

export async function generateTemplateArtifact(
  userPrompt,
  llm,
  options = {}
) {
  const maxRetries = options.maxRetries ?? 3;

  let lastError = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    let aiOutput;

    const systemPrompt =
      lastError == null
        ? ccmAuthorPrompt
        : `${ccmAuthorPrompt}

The previous output was rejected by the validator with this error:

${String(lastError)}

You MUST fix this error and regenerate a FULL, VALID CCM v1 Template Artifact.
Do not repeat the same mistake.`;

    try {
      aiOutput = await llm.generate({
        system: systemPrompt,
        prompt: userPrompt,
      });
    } catch (err) {
      throw new Error(
        `LLM generate() failed on attempt ${attempt}: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    }

    let parsed;

    try {
      parsed = JSON.parse(aiOutput);
    } catch {
      lastError = 'AI output was not valid JSON';
      continue;
    }

    try {
      validateTemplateArtifact(parsed);
      return parsed;
    } catch (err) {
      lastError = err instanceof Error ? err.message : 'Unknown validation error';
    }
  }

  throw new Error(
    `Failed to generate a valid CCM template after ${maxRetries} attempts. Last error: ${String(
      lastError
    )}`
  );
}
