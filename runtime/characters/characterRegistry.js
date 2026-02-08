import { nanoid } from 'nanoid';
import { getRuntimeState } from '@/runtime/state/runtimeState.js';

const characters = new Map();
const nodeToCharacter = new Map();
const characterBases = new Map();
const aimTarget = { x: 0, y: 0 };
const __DEV__ = process.env.NODE_ENV !== 'production';

function isCharacterRoot(nodeId) {
    if (!nodeId) return false;
    for (const character of characters.values()) {
        if (character?.rootId === nodeId) return true;
    }
    return false;
}

function snapshotLayout(node) {
    const layout = node?.layout || {};
    return {
        x: Number.isFinite(layout.x) ? layout.x : 0,
        y: Number.isFinite(layout.y) ? layout.y : 0,
        width: Number.isFinite(layout.width) ? layout.width : 0,
        height: Number.isFinite(layout.height) ? layout.height : 0,
    };
}

export function createCharacter({ rootId, partIds = [] } = {}) {
    if (!rootId || !Array.isArray(partIds)) return null;

    const runtime = getRuntimeState();
    const nodes = runtime?.nodes || {};
    const root = nodes[rootId];
    if (!root) return null;

    if (partIds.some((id) => isCharacterRoot(id))) {
        if (__DEV__) {
            console.warn('[Character] Nested characters not supported in v1.x');
        }
        return null;
    }

    const rootBase = snapshotLayout(root);
    const constraints = {};
    const bases = { root: rootBase, parts: {} };

    partIds.forEach((partId) => {
        if (!partId || partId === rootId) return;
        const part = nodes[partId];
        if (!part) return;

        const partBase = snapshotLayout(part);
        bases.parts[partId] = partBase;

        constraints[partId] = {
            follow: {
                targetId: rootId,
                offset: {
                    x: partBase.x - rootBase.x,
                    y: partBase.y - rootBase.y,
                    width: Number.isFinite(partBase.width) ? partBase.width - rootBase.width : undefined,
                    height: Number.isFinite(partBase.height) ? partBase.height - rootBase.height : undefined,
                },
            },
        };
    });

    const id = `character-${nanoid()}`;
    const character = {
        id,
        rootId,
        partIds: partIds.filter((id) => id && id !== rootId),
        constraints,
    };

    characters.set(id, character);
    characterBases.set(id, bases);

    nodeToCharacter.set(rootId, id);
    character.partIds.forEach((partId) => nodeToCharacter.set(partId, id));

    return character;
}

export function removeCharacter(characterId) {
    const character = characters.get(characterId);
    if (!character) return false;

    nodeToCharacter.delete(character.rootId);
    character.partIds.forEach((partId) => nodeToCharacter.delete(partId));

    characters.delete(characterId);
    characterBases.delete(characterId);
    return true;
}

export function getCharacterById(characterId) {
    return characters.get(characterId) || null;
}

export function getCharacterByNodeId(nodeId) {
    const characterId = nodeToCharacter.get(nodeId);
    if (!characterId) return null;
    return characters.get(characterId) || null;
}

export function getCharacterBase(characterId) {
    return characterBases.get(characterId) || null;
}

export function updateCharacterConstraint(partId, updater) {
    const character = getCharacterByNodeId(partId);
    if (!character) return null;
    const nextConstraints = { ...(character.constraints || {}) };
    const current = nextConstraints[partId] || {};
    const next = typeof updater === 'function' ? updater(current) : updater;
    nextConstraints[partId] = { ...current, ...next };
    const updated = { ...character, constraints: nextConstraints };
    characters.set(character.id, updated);
    return updated;
}

export function getConstraintForPart(partId) {
    const character = getCharacterByNodeId(partId);
    if (!character) return null;
    return character.constraints?.[partId] || null;
}

export function setAimTarget(point) {
    if (!point) return;
    if (Number.isFinite(point.x)) aimTarget.x = point.x;
    if (Number.isFinite(point.y)) aimTarget.y = point.y;
}

export function getAimTarget() {
    return { x: aimTarget.x, y: aimTarget.y };
}
