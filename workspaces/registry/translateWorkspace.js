import { conversionWorkspace } from "./conversionWorkspace";

/**
 * Translate Workspace (canonical)
 * Alias of legacy conversionWorkspace.
 * Behavior-identical by design.
 */
export const translateWorkspace = {
  ...conversionWorkspace,
  id: "translate",
  label: "Translate",
};
