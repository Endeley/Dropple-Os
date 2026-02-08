// ⚠️ Animation v1 contract
// This file is part of the locked Animation v1 system.
// Do not extend with bones / IK / deformation.
// See docs/ANIMATION_V1.md

import { getAimTarget, getCharacterByNodeId, getCharacterBase } from './characterRegistry.js';

function safeNumber(value, fallback = 0) {
    return Number.isFinite(value) ? value : fallback;
}

export function applyCharacterConstraints(nodes) {
    if (!nodes) return nodes;

    const nextNodes = { ...nodes };
    const handledCharacters = new Set();

    Object.keys(nodes).forEach((nodeId) => {
        const character = getCharacterByNodeId(nodeId);
        if (!character) return;
        if (handledCharacters.has(character.id)) return;
        handledCharacters.add(character.id);

        const root = nodes[character.rootId];
        if (!root?.layout) return;

        const base = getCharacterBase(character.id);
        const rootLayout = root.layout;

        character.partIds.forEach((partId) => {
            const part = nodes[partId];
            if (!part?.layout) return;

            const partBase = base?.parts?.[partId] || {
                x: safeNumber(part.layout.x),
                y: safeNumber(part.layout.y),
                width: safeNumber(part.layout.width),
                height: safeNumber(part.layout.height),
            };

            const constraint = character.constraints?.[partId] || {};
            const follow = constraint.follow;

            let targetLayout = rootLayout;
            let offset = {
                x: partBase.x - safeNumber(rootLayout.x),
                y: partBase.y - safeNumber(rootLayout.y),
                width: Number.isFinite(partBase.width) ? partBase.width - safeNumber(rootLayout.width) : undefined,
                height: Number.isFinite(partBase.height) ? partBase.height - safeNumber(rootLayout.height) : undefined,
            };

            if (follow === null) {
                targetLayout = { x: 0, y: 0, width: 0, height: 0 };
                offset = {
                    x: partBase.x,
                    y: partBase.y,
                    width: partBase.width,
                    height: partBase.height,
                };
            } else if (follow && typeof follow === 'object') {
                const targetNode = nodes[follow.targetId] || root;
                targetLayout = targetNode?.layout || rootLayout;
                offset = follow.offset || offset;
            }

            let deltaX = safeNumber(part.layout.x, partBase.x) - partBase.x;
            let deltaY = safeNumber(part.layout.y, partBase.y) - partBase.y;
            const deltaW = safeNumber(part.layout.width, partBase.width) - partBase.width;
            const deltaH = safeNumber(part.layout.height, partBase.height) - partBase.height;

            if (constraint.pin?.axis === 'x' || constraint.pin?.axis === 'both') {
                deltaX = 0;
            }
            if (constraint.pin?.axis === 'y' || constraint.pin?.axis === 'both') {
                deltaY = 0;
            }

            const derivedLayout = {
                ...part.layout,
                x: safeNumber(targetLayout.x) + safeNumber(offset.x) + deltaX,
                y: safeNumber(targetLayout.y) + safeNumber(offset.y) + deltaY,
            };

            if (offset.width != null && Number.isFinite(targetLayout.width)) {
                derivedLayout.width = safeNumber(targetLayout.width) + safeNumber(offset.width) + deltaW;
            } else {
                derivedLayout.width = partBase.width + deltaW;
            }

            if (offset.height != null && Number.isFinite(targetLayout.height)) {
                derivedLayout.height = safeNumber(targetLayout.height) + safeNumber(offset.height) + deltaH;
            } else {
                derivedLayout.height = partBase.height + deltaH;
            }

            let derivedRotation = part.rotation;
            if (constraint.aim?.axis === 'rotation') {
                const center = {
                    x: derivedLayout.x + derivedLayout.width / 2,
                    y: derivedLayout.y + derivedLayout.height / 2,
                };
                let targetPoint = null;
                if (constraint.aim?.target === 'cursor') {
                    targetPoint = getAimTarget();
                } else if (typeof constraint.aim?.target === 'string') {
                    const aimNode = nodes[constraint.aim.target];
                    if (aimNode?.layout) {
                        targetPoint = {
                            x: aimNode.layout.x + (aimNode.layout.width ?? 0) / 2,
                            y: aimNode.layout.y + (aimNode.layout.height ?? 0) / 2,
                        };
                    }
                }
                if (targetPoint) {
                    const angle = Math.atan2(targetPoint.y - center.y, targetPoint.x - center.x);
                    if (constraint.aim?.clamp) {
                        const min = constraint.aim.clamp.min ?? angle;
                        const max = constraint.aim.clamp.max ?? angle;
                        derivedRotation = Math.max(min, Math.min(max, angle));
                    } else {
                        derivedRotation = angle;
                    }
                }
            }

            nextNodes[partId] = {
                ...part,
                layout: derivedLayout,
                x: derivedLayout.x,
                y: derivedLayout.y,
                width: derivedLayout.width,
                height: derivedLayout.height,
                rotation: derivedRotation,
            };
        });
    });

    return nextNodes;
}
