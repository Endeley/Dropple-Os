import { EventTypes } from '@/core/events/eventTypes.js';

function asObject(value) {
    return value && typeof value === 'object' && !Array.isArray(value) ? value : null;
}

function asNonEmptyString(value) {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
}

function asFiniteNumber(value) {
    return Number.isFinite(value) ? Number(value) : null;
}

function resolveBootstrap(document) {
    return asObject(asObject(document)?.meta)?.projectBootstrap ?? null;
}

function resolveBootstrapEventTimestamps(events) {
    if (!Array.isArray(events) || events.length === 0) {
        return Object.freeze({ createdAt: null, updatedAt: null });
    }
    const bootstrapEvents = events.filter((event) => event?.type === EventTypes.PROJECT_BLUEPRINT_BOOTSTRAP);
    const createdAt = asFiniteNumber(bootstrapEvents[0]?.timestamp ?? null);
    const updatedAt = asFiniteNumber(events[events.length - 1]?.timestamp ?? null);
    return Object.freeze({
        createdAt,
        updatedAt,
    });
}

function normalizePerspectives(input) {
    const source = asObject(input);
    if (!source) return undefined;
    const normalized = Object.freeze({
        ...(source.create === true ? { create: true } : {}),
        ...(source.build === true ? { build: true } : {}),
        ...(source.operate === true ? { operate: true } : {}),
        ...(source.collaborate === true ? { collaborate: true } : {}),
        ...(source.publish === true ? { publish: true } : {}),
    });
    return Object.keys(normalized).length > 0 ? normalized : undefined;
}

export function resolveProjectIdentityFromProjection({ document = null, events = [] } = {}) {
    const bootstrap = resolveBootstrap(document);
    const timestamps = resolveBootstrapEventTimestamps(events);
    const projectId = asNonEmptyString(bootstrap?.projectId) ?? null;
    const name = asNonEmptyString(bootstrap?.projectName) ?? projectId ?? 'Untitled Project';
    const blueprintId = asNonEmptyString(bootstrap?.blueprintId) ?? null;
    const owner = asNonEmptyString(bootstrap?.owner) ?? null;
    const metadata = asObject(bootstrap?.metadata) ?? undefined;
    const perspectives = normalizePerspectives(bootstrap?.perspectives);

    return Object.freeze({
        version: 1,
        projectId,
        name,
        blueprintId,
        createdAt: timestamps.createdAt,
        updatedAt: timestamps.updatedAt ?? timestamps.createdAt,
        owner,
        metadata,
        perspectives,
    });
}
