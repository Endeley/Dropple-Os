// core/nodes/createNode.js

/**
 * Pure node factory.
 *
 * 🔒 ID POLICY (Phase 8):
 * - This function MUST NOT generate IDs
 * - nodeId is assigned at the event / MessageBus boundary
 * - This function is deterministic and replay-safe
 */
/**
 * NOTE:
 * - This factory must not inject defaults (especially layout defaults).
 * - Defaults belong exclusively in `design/state/normalizeNodeShape.js`.
 */
export function createNode({ id, type, children, ...rest }) {
    if (!id) {
        throw new Error('createNode: id (nodeId) is required');
    }

    return {
        id,
        type,
        children,
        ...rest,
    };
}
