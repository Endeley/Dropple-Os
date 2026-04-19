/**
 * INTENTS (Canonical Intent Vocabulary)
 *
 * This is the ONLY place where intent names are defined.
 *
 * Rules:
 * - UI MUST emit only these
 * - Bridges MUST listen only to these
 * - No string literals anywhere else
 *
 * Format:
 * intent.<domain>.<action>
 */

export const INTENTS = Object.freeze({
    // --- Workspace ---
    WORKSPACE_ACTIVATE: 'intent.workspace.activate',

    // --- Tool ---
    TOOL_SET_ACTIVE: 'intent.tool.setActive',

    // --- Selection ---
    SELECTION_SET: 'intent.selection.set',
    SELECTION_ADD: 'intent.selection.add',
    SELECTION_CLEAR: 'intent.selection.clear',

    // --- Node ---
    NODE_CREATE: 'intent.node.create',
    NODE_UPDATE: 'intent.node.update',
    NODE_DELETE: 'intent.node.delete',

    // --- Input / Interaction ---
    INPUT_POINTER_DOWN: 'intent.input.pointerDown',
    INPUT_POINTER_MOVE: 'intent.input.pointerMove',
    INPUT_POINTER_UP: 'intent.input.pointerUp',

    // --- Drag ---
    DRAG_START: 'intent.drag.start',
    DRAG_UPDATE: 'intent.drag.update',
    DRAG_END: 'intent.drag.end',

    // --- Viewport ---
    VIEWPORT_SET: 'intent.viewport.set',

    // --- Canvas ---
    CANVAS_SURFACE_SET: 'intent.canvas.surface.set',

    // --- Timeline ---
    TIMELINE_UPDATE: 'intent.timeline.update',

    // --- Command ---
    COMMAND_EXECUTE: 'intent.command.execute',
});
