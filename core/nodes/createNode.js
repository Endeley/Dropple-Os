// core/nodes/createNode.js

/**
 * Pure node factory.
 *
 * 🔒 ID POLICY (Phase 8):
 * - This function MUST NOT generate IDs
 * - nodeId is assigned at the event / MessageBus boundary
 * - This function is deterministic and replay-safe
 */
export function createNode({ id, type = 'frame', children = [], ...rest }) {
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
