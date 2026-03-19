import { safeNumber } from '../blending/blendUtils.js';

const STAGE_ORDER = {
    pre: 0,
    main: 1,
    post: 2,
};

function compareConstraints(left, right) {
    const leftStage = STAGE_ORDER[left?.stage ?? 'main'] ?? STAGE_ORDER.main;
    const rightStage = STAGE_ORDER[right?.stage ?? 'main'] ?? STAGE_ORDER.main;

    if (leftStage !== rightStage) {
        return leftStage - rightStage;
    }

    const leftPriority = safeNumber(left?.priority ?? 0);
    const rightPriority = safeNumber(right?.priority ?? 0);

    if (leftPriority !== rightPriority) {
        return rightPriority - leftPriority;
    }

    return String(left?.id ?? '').localeCompare(String(right?.id ?? ''));
}

function applyLimitRotation(nodeMap, constraint) {
    const targetId = constraint?.target ?? null;
    if (!targetId || !nodeMap[targetId]) return;

    const node = nodeMap[targetId];
    const min = safeNumber(constraint?.min ?? -Math.PI);
    const max = safeNumber(constraint?.max ?? Math.PI);
    const rotation = safeNumber(node?.rotation ?? 0);

    nodeMap[targetId] = {
        ...node,
        rotation: Math.max(min, Math.min(max, rotation)),
    };
}

function applyCopyTransform(nodeMap, constraint) {
    const sourceId = constraint?.source ?? null;
    const targetId = constraint?.target ?? null;
    if (!sourceId || !targetId) return;

    const source = nodeMap[sourceId];
    const target = nodeMap[targetId];
    if (!source || !target) return;

    nodeMap[targetId] = {
        ...target,
        x: source.x,
        y: source.y,
        rotation: source.rotation,
    };
}

function applyAimConstraint(nodeMap, constraint) {
    const targetId = constraint?.target ?? null;
    const lookAtId = constraint?.lookAt ?? null;
    if (!targetId || !lookAtId) return;

    const node = nodeMap[targetId];
    const lookAt = nodeMap[lookAtId];
    if (!node || !lookAt) return;

    const dx = safeNumber(lookAt?.x) - safeNumber(node?.x);
    const dy = safeNumber(lookAt?.y) - safeNumber(node?.y);

    nodeMap[targetId] = {
        ...node,
        rotation: Math.atan2(dy, dx),
    };
}

function applyConstraint(nodeMap, constraint, context) {
    void context;

    switch (constraint?.type) {
        case 'limitRotation':
            applyLimitRotation(nodeMap, constraint);
            break;
        case 'copyTransform':
            applyCopyTransform(nodeMap, constraint);
            break;
        case 'aim':
            applyAimConstraint(nodeMap, constraint);
            break;
        default:
            break;
    }
}

export function applyConstraintStack(nodes, constraints = [], context = {}) {
    if (!Array.isArray(constraints) || constraints.length === 0) {
        return nodes;
    }

    const nodeMap = { ...(nodes ?? {}) };
    const sorted = constraints.slice().sort(compareConstraints);

    for (const constraint of sorted) {
        applyConstraint(nodeMap, constraint, context);
    }

    return nodeMap;
}
