import { ccmAuthorPrompt } from "../prompts/ccmAuthorPrompt";
import { validateTemplateArtifact } from "../../core/ccm/validate/validateTemplateArtifact";
import { TemplateArtifactV1 } from "../../core/ccm/types";

export type GenerateTemplateOptions = {
  maxRetries?: number;
};

export type LLM = {
  generate(input: {
    system: string;
    prompt: string;
  }): Promise<string>;
};

/**
 * Generates a CCM v1 Template Artifact from a user prompt.
 * Uses validator-driven retries and injected LLM.
 */
export async function generateTemplateArtifact(
  userPrompt: string,
  llm: LLM,
  options: GenerateTemplateOptions = {}
): Promise<TemplateArtifactV1> {
  const maxRetries = options.maxRetries ?? 3;

  let lastError: unknown = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    let aiOutput: string;

    try {
      aiOutput = await llm.generate({
        system: ccmAuthorPrompt,
        prompt: userPrompt,
      });
    } catch (err) {
      throw new Error(
        `LLM generate() failed on attempt ${attempt}: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    }

    let parsed: unknown;

    try {
      parsed = JSON.parse(aiOutput);
    } catch {
      lastError = "AI output was not valid JSON";
      continue;
    }

    try {
      validateTemplateArtifact(parsed);
      return parsed as TemplateArtifactV1;
    } catch (err) {
      lastError =
        err instanceof Error ? err.message : "Unknown validation error";
      continue;
    }
  }

  throw new Error(
    `Failed to generate a valid CCM template after ${maxRetries} attempts. ` +
      `Last error: ${String(lastError)}`
  );
}
