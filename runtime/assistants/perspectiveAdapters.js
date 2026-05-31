import { resolveRuntimeProjectPerspectiveContext } from '@/runtime/assistants/projectPerspectiveContext.js';

const ADAPTERS_BY_PERSPECTIVE = Object.freeze({
    overview: Object.freeze({
        id: 'adapter.overview',
        perspectiveId: 'overview',
        label: 'Overview Assistant Adapter',
    }),
    create: Object.freeze({
        id: 'adapter.create',
        perspectiveId: 'create',
        label: 'Create Assistant Adapter',
    }),
    build: Object.freeze({
        id: 'adapter.build',
        perspectiveId: 'build',
        label: 'Build Assistant Adapter',
    }),
    operate: Object.freeze({
        id: 'adapter.operate',
        perspectiveId: 'operate',
        label: 'Operate Assistant Adapter',
    }),
    collaborate: Object.freeze({
        id: 'adapter.collaborate',
        perspectiveId: 'collaborate',
        label: 'Collaborate Assistant Adapter',
    }),
    publish: Object.freeze({
        id: 'adapter.publish',
        perspectiveId: 'publish',
        label: 'Publish Assistant Adapter',
    }),
});

export function listPerspectiveAssistantAdapters() {
    return Object.freeze(
        Object.values(ADAPTERS_BY_PERSPECTIVE).sort((left, right) => left.id.localeCompare(right.id)),
    );
}

export function getPerspectiveAssistantAdapter(perspectiveId) {
    const normalized = String(perspectiveId ?? '').trim().toLowerCase();
    if (!normalized) return null;
    return ADAPTERS_BY_PERSPECTIVE[normalized] ?? null;
}

export function resolvePerspectiveAssistantAdapter({ perspectiveId, entryId } = {}) {
    const context = resolveRuntimeProjectPerspectiveContext({ perspectiveId, entryId });
    const adapter = getPerspectiveAssistantAdapter(context.perspectiveId) ?? ADAPTERS_BY_PERSPECTIVE.overview;
    return Object.freeze({
        ...adapter,
        entryId: context.entryId,
        workspaceId: context.workspaceId,
        modeId: context.modeId,
        overlayId: context.overlayId,
    });
}
