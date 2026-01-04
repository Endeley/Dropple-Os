/**
 * WorkspaceDefinition
 *
 * This is a CONTRACT, not an implementation.
 * Every workspace must conform to this shape.
 *
 * ❗ No UI logic
 * ❗ No engine logic
 * ❗ No runtime behavior
 */
export const WorkspaceDefinition = {
    /**
     * Unique workspace identifier
     * Used in routing, persistence, permissions
     */
    id: "",

    /**
     * Human-readable label
     */
    label: "",

    /**
     * Workspace lifecycle state
     * - "active": fully supported
     * - "stub": registered but incomplete
     * - "experimental": hidden / unsafe
     */
    status: "stub",

    /**
     * Parent workspace (optional)
     * Enables inheritance (e.g. uiux extends graphic)
     */
    extends: null,

    engines: [],
    tools: [],
    panels: [],

    /**
     * Capabilities toggle major subsystems
     */
    capabilities: {
        canvas: true,
        timeline: false,
        animation: false,
        audio: false,
        video: false,
        codegen: false,
    },

    /**
     * Timeline configuration (only if enabled)
     */
    timeline: null,

    /**
     * Export targets enabled by this workspace
     * Does NOT guarantee implementation exists
     */
    export: null,
};
