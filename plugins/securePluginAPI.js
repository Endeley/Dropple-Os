/**
 * Injects only the derived capabilities into the sandbox.
 * Security comes from what is included, not from wrappers.
 */
export function createSecurePluginAPI(capabilities) {
    return Object.freeze(capabilities);
}
