import { createCanonicalScheduleSignature } from '@/runtime/scheduler/scheduleIdentity.js';

function normalizePassId(value, fallbackIndex) {
    const raw = String(value ?? '').trim();
    return raw ? raw : `pass:${fallbackIndex}`;
}

export function normalizeRenderPasses(passDeclarations = []) {
    const seen = new Set();
    const normalized = [];
    const source = Array.isArray(passDeclarations) ? passDeclarations : [];
    for (let index = 0; index < source.length; index += 1) {
        const declaration = source[index] ?? {};
        const passId = normalizePassId(declaration.passId ?? declaration.id, index);
        if (seen.has(passId)) continue;
        seen.add(passId);
        normalized.push(
            Object.freeze({
                passId,
                order: Number.isFinite(declaration.order) ? Number(declaration.order) : index,
            }),
        );
    }

    normalized.sort((left, right) => {
        if (left.order !== right.order) return left.order - right.order;
        return left.passId.localeCompare(right.passId);
    });

    return Object.freeze(normalized);
}

export function createRenderGraphEnvelope({
    frameTime = 0,
    renderGraph = null,
    passes = [],
} = {}) {
    const normalizedPasses = normalizeRenderPasses(passes);
    const passIds = normalizedPasses.map((entry) => entry.passId);
    const scheduleSignature = createCanonicalScheduleSignature({
        partitionIds: passIds,
        tickTime: frameTime,
        deltaTime: 0,
    });

    return Object.freeze({
        frameTime: Number.isFinite(frameTime) ? Number(frameTime) : 0,
        renderGraph,
        passes: normalizedPasses,
        passIds: Object.freeze(passIds),
        scheduleSignature,
    });
}

