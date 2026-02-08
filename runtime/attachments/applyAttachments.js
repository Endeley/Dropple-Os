// ⚠️ Animation v1 contract
// This file is part of the locked Animation v1 system.
// Do not extend with bones / IK / deformation.
// See docs/ANIMATION_V1.md

import { getAllAttachments, getAttachmentBase } from './attachmentRegistry.js';

function safeNumber(value, fallback = 0) {
    return Number.isFinite(value) ? value : fallback;
}

export function applyAttachments(nodes) {
    if (!nodes) return nodes;

    const nextNodes = { ...nodes };
    const attachments = getAllAttachments();

    attachments.forEach((attachment) => {
        const host = nodes[attachment.hostId];
        const prop = nodes[attachment.propId];
        if (!host?.layout || !prop?.layout) return;

        const base = getAttachmentBase(attachment.id);
        const propBase = base?.prop || {
            x: safeNumber(prop.layout.x),
            y: safeNumber(prop.layout.y),
            width: safeNumber(prop.layout.width),
            height: safeNumber(prop.layout.height),
        };

        const socketOffset = attachment.socket?.offset || { x: 0, y: 0 };
        const hostCenter = {
            x: safeNumber(host.layout.x) + safeNumber(host.layout.width) / 2,
            y: safeNumber(host.layout.y) + safeNumber(host.layout.height) / 2,
        };

        const deltaX = attachment.mode === 'follow'
            ? safeNumber(prop.layout.x, propBase.x) - propBase.x
            : 0;
        const deltaY = attachment.mode === 'follow'
            ? safeNumber(prop.layout.y, propBase.y) - propBase.y
            : 0;
        const deltaW = attachment.mode === 'follow'
            ? safeNumber(prop.layout.width, propBase.width) - propBase.width
            : 0;
        const deltaH = attachment.mode === 'follow'
            ? safeNumber(prop.layout.height, propBase.height) - propBase.height
            : 0;

        const derivedLayout = {
            ...prop.layout,
            x: hostCenter.x + safeNumber(socketOffset.x) + deltaX,
            y: hostCenter.y + safeNumber(socketOffset.y) + deltaY,
            width: propBase.width + deltaW,
            height: propBase.height + deltaH,
        };

        const derivedRotation = socketOffset.rotation != null
            ? safeNumber(socketOffset.rotation) + safeNumber(host.rotation)
            : prop.rotation;

        nextNodes[prop.id] = {
            ...prop,
            layout: derivedLayout,
            x: derivedLayout.x,
            y: derivedLayout.y,
            width: derivedLayout.width,
            height: derivedLayout.height,
            rotation: derivedRotation,
        };
    });

    return nextNodes;
}
