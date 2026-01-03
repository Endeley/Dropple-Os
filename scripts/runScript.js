import { runScriptWithGuards } from './scriptGuards.js';

/**
 * Runs a script with hard caps via runScriptWithGuards.
 */
export function runScript(script, context) {
    return runScriptWithGuards(script, context);
}
