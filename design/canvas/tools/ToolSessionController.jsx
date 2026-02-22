'use client';

/**
 * ToolSessionController
 *
 * Reads activeToolId and emits tool-intent messages.
 * Behavior logic is out-of-scope for this controller.
 */
export function ToolSessionController({ activeToolId, onIntent }) {
    if (!activeToolId || typeof onIntent !== 'function') return null;
    return null;
}

