import { validateTemplateArtifact } from "../core/ccm/validate/validateTemplateArtifact";

/**
 * Validates a template before it is accepted into the system.
 * This is a HARD GATE.
 *
 * @param {unknown} templateArtifact
 * @returns {{ ok: true }}
 * @throws Error if invalid
 */
export function validateTemplate(templateArtifact) {
  try {
    // Delegate to CCM (single source of truth)
    return validateTemplateArtifact(templateArtifact);
  } catch (err) {
    // Do NOT auto-fix
    // Do NOT downgrade errors to warnings
    if (err instanceof Error) {
      throw new Error(`[TemplateValidator] Template rejected: ${err.message}`);
    }
    throw err;
  }
}
