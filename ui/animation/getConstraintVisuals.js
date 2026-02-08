import { getAimTarget, getCharacterByNodeId } from '@/runtime/characters/characterRegistry.js';
import { getAllAttachments, getSocketsForHost } from '@/runtime/attachments/attachmentRegistry.js';

function getCenter(layout) {
    if (!layout) return null;
    const x = Number.isFinite(layout.x) ? layout.x : null;
    const y = Number.isFinite(layout.y) ? layout.y : null;
    const w = Number.isFinite(layout.width) ? layout.width : null;
    const h = Number.isFinite(layout.height) ? layout.height : null;
    if (x == null || y == null || w == null || h == null) return null;
    return { x: x + w / 2, y: y + h / 2 };
}

export function getConstraintVisuals({ nodes }) {
    const followLines = [];
    const pinMarkers = [];
    const aimRays = [];
    const sockets = [];
    const socketKeys = new Set();

    if (!nodes) {
        return { followLines, pinMarkers, aimRays, sockets };
    }

    const handledCharacters = new Set();
    Object.keys(nodes).forEach((nodeId) => {
        const character = getCharacterByNodeId(nodeId);
        if (!character || handledCharacters.has(character.id)) return;
        handledCharacters.add(character.id);

        const rootNode = nodes[character.rootId];
        const rootCenter = getCenter(rootNode?.layout);

        character.partIds.forEach((partId) => {
            const part = nodes[partId];
            if (!part?.layout) return;
            const partCenter = getCenter(part.layout);
            if (!partCenter) return;

            const constraint = character.constraints?.[partId] || {};
            const follow = constraint.follow;

            if (follow && follow !== null) {
                const targetId = follow.targetId || character.rootId;
                const targetNode = nodes[targetId] || rootNode;
                const targetCenter = getCenter(targetNode?.layout) || rootCenter;
                if (targetCenter) {
                    followLines.push({
                        from: partCenter,
                        to: targetCenter,
                        partId,
                        targetId,
                    });
                }
            }

            if (constraint.pin?.axis) {
                pinMarkers.push({
                    at: partCenter,
                    axis: constraint.pin.axis,
                    partId,
                });
            }

            if (constraint.aim?.axis === 'rotation') {
                let targetPoint = null;
                if (constraint.aim.target === 'cursor') {
                    targetPoint = getAimTarget();
                } else if (typeof constraint.aim.target === 'string') {
                    const aimNode = nodes[constraint.aim.target];
                    targetPoint = getCenter(aimNode?.layout);
                }

                if (targetPoint) {
                    aimRays.push({
                        from: partCenter,
                        to: targetPoint,
                        partId,
                        target: constraint.aim.target,
                    });
                }
            }
        });
    });

    const attachments = getAllAttachments();
    attachments.forEach((attachment) => {
        const host = nodes[attachment.hostId];
        if (!host?.layout) return;
        const hostCenter = getCenter(host.layout);
        if (!hostCenter) return;
        const offset = attachment.socket?.offset || { x: 0, y: 0 };
        const key = `${attachment.hostId}:${attachment.socket?.name || 'socket'}`;
        if (socketKeys.has(key)) return;
        socketKeys.add(key);
        sockets.push({
            at: {
                x: hostCenter.x + (Number.isFinite(offset.x) ? offset.x : 0),
                y: hostCenter.y + (Number.isFinite(offset.y) ? offset.y : 0),
            },
            name: attachment.socket?.name || 'socket',
            hostId: attachment.hostId,
            propId: attachment.propId,
        });
    });

    Object.keys(nodes).forEach((hostId) => {
        const socketMap = getSocketsForHost(hostId);
        const host = nodes[hostId];
        if (!host?.layout) return;
        const hostCenter = getCenter(host.layout);
        if (!hostCenter) return;
        Object.values(socketMap || {}).forEach((socket) => {
            const offset = socket?.offset || { x: 0, y: 0 };
            const key = `${hostId}:${socket?.name || 'socket'}`;
            if (socketKeys.has(key)) return;
            socketKeys.add(key);
            sockets.push({
                at: {
                    x: hostCenter.x + (Number.isFinite(offset.x) ? offset.x : 0),
                    y: hostCenter.y + (Number.isFinite(offset.y) ? offset.y : 0),
                },
                name: socket?.name || 'socket',
                hostId,
            });
        });
    });

    return { followLines, pinMarkers, aimRays, sockets };
}
