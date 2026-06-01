import { PROJECT_VERSION } from '@/core/contracts/project.v1.js';

const PROJECT_EVENT_TYPES = Object.freeze({
    PROJECT_CREATE: 'project.create',
    PROJECT_ARCHIVE: 'project.archive',
});

function normalizeNonEmptyString(value, fieldName) {
    if (typeof value !== 'string') {
        throw new Error(`${fieldName} must be a string`);
    }
    const trimmed = value.trim();
    if (trimmed.length === 0) {
        throw new Error(`${fieldName} must be a non-empty string`);
    }
    return trimmed;
}

function normalizeOptionalString(value) {
    if (value == null) return null;
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
}

function normalizeTimestamp(value, fieldName) {
    if (!Number.isFinite(value)) {
        throw new Error(`${fieldName} must be a finite number`);
    }
    return Number(value);
}

function normalizePerspectives(perspectives) {
    if (!perspectives || typeof perspectives !== 'object') return undefined;
    const normalized = Object.freeze({
        ...(perspectives.create === true ? { create: true } : {}),
        ...(perspectives.build === true ? { build: true } : {}),
        ...(perspectives.operate === true ? { operate: true } : {}),
        ...(perspectives.collaborate === true ? { collaborate: true } : {}),
        ...(perspectives.publish === true ? { publish: true } : {}),
    });
    return Object.keys(normalized).length > 0 ? normalized : undefined;
}

function normalizeMetadata(metadata) {
    if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) return undefined;
    const entries = Object.entries(metadata).sort(([a], [b]) => a.localeCompare(b));
    return Object.freeze(Object.fromEntries(entries));
}

function normalizeProjectCreatePayload(payload) {
    if (!payload || typeof payload !== 'object') {
        throw new Error('project create payload must be an object');
    }
    const projectId = normalizeNonEmptyString(payload.projectId, 'projectId');
    const name = normalizeNonEmptyString(payload.name, 'name');
    const createdAt = normalizeTimestamp(payload.createdAt, 'createdAt');
    const updatedAt = normalizeTimestamp(payload.updatedAt ?? payload.createdAt, 'updatedAt');
    const blueprintId = normalizeOptionalString(payload.blueprintId);
    const owner = normalizeOptionalString(payload.owner);
    const metadata = normalizeMetadata(payload.metadata);
    const perspectives = normalizePerspectives(payload.perspectives);

    return Object.freeze({
        version: PROJECT_VERSION,
        projectId,
        name,
        blueprintId,
        createdAt,
        updatedAt,
        owner,
        metadata,
        perspectives,
        archivedAt: null,
    });
}

function normalizeProjectArchivePayload(payload) {
    if (!payload || typeof payload !== 'object') {
        throw new Error('project archive payload must be an object');
    }
    return Object.freeze({
        projectId: normalizeNonEmptyString(payload.projectId, 'projectId'),
        archivedAt: normalizeTimestamp(payload.archivedAt, 'archivedAt'),
    });
}

function freezeRegistryState(state) {
    return Object.freeze({
        projectsById: Object.freeze({ ...state.projectsById }),
    });
}

function createEmptyState() {
    return freezeRegistryState({
        projectsById: Object.create(null),
    });
}

export function applyProjectRegistryEvent(state, event) {
    const current = state ?? createEmptyState();
    if (!event || typeof event !== 'object') {
        throw new Error('project registry event must be an object');
    }
    const eventType = normalizeNonEmptyString(event.type, 'event.type');
    const payload = event.payload;

    if (eventType === PROJECT_EVENT_TYPES.PROJECT_CREATE) {
        const nextProject = normalizeProjectCreatePayload(payload);
        if (current.projectsById[nextProject.projectId]) {
            throw new Error(`project already exists: ${nextProject.projectId}`);
        }
        return freezeRegistryState({
            projectsById: {
                ...current.projectsById,
                [nextProject.projectId]: Object.freeze(nextProject),
            },
        });
    }

    if (eventType === PROJECT_EVENT_TYPES.PROJECT_ARCHIVE) {
        const archive = normalizeProjectArchivePayload(payload);
        const existing = current.projectsById[archive.projectId];
        if (!existing) {
            throw new Error(`cannot archive unknown project: ${archive.projectId}`);
        }
        const archived = Object.freeze({
            ...existing,
            updatedAt: archive.archivedAt,
            archivedAt: archive.archivedAt,
        });
        return freezeRegistryState({
            projectsById: {
                ...current.projectsById,
                [archive.projectId]: archived,
            },
        });
    }

    throw new Error(`unsupported project registry event type: ${eventType}`);
}

export function replayProjectRegistryEvents(events = []) {
    if (!Array.isArray(events)) {
        throw new Error('project registry replay events must be an array');
    }
    return events.reduce((state, event) => applyProjectRegistryEvent(state, event), createEmptyState());
}

export function createProjectRegistry({ now = Date.now } = {}) {
    if (typeof now !== 'function') {
        throw new Error('project registry now must be a function');
    }
    let state = createEmptyState();
    const events = [];

    function append(type, payload) {
        const event = Object.freeze({
            type,
            payload: Object.freeze({ ...payload }),
        });
        state = applyProjectRegistryEvent(state, event);
        events.push(event);
        return event;
    }

    return Object.freeze({
        createProject({
            projectId,
            name,
            blueprintId = null,
            owner = null,
            metadata = undefined,
            perspectives = undefined,
            createdAt = now(),
            updatedAt = createdAt,
        } = {}) {
            append(PROJECT_EVENT_TYPES.PROJECT_CREATE, {
                projectId,
                name,
                blueprintId,
                owner,
                metadata,
                perspectives,
                createdAt,
                updatedAt,
            });
            return state.projectsById[String(projectId).trim()];
        },
        getProject(projectId) {
            const id = normalizeNonEmptyString(projectId, 'projectId');
            return state.projectsById[id] ?? null;
        },
        listProjects({ includeArchived = true } = {}) {
            const all = Object.values(state.projectsById).sort((left, right) => {
                if (left.createdAt !== right.createdAt) return left.createdAt - right.createdAt;
                return left.projectId.localeCompare(right.projectId);
            });
            const filtered = includeArchived ? all : all.filter((project) => project.archivedAt == null);
            return Object.freeze(filtered);
        },
        archiveProject(projectId, { archivedAt = now() } = {}) {
            append(PROJECT_EVENT_TYPES.PROJECT_ARCHIVE, {
                projectId,
                archivedAt,
            });
            return state.projectsById[normalizeNonEmptyString(projectId, 'projectId')];
        },
        getEvents() {
            return Object.freeze([...events]);
        },
        getState() {
            return state;
        },
    });
}

export const ProjectRegistryEventTypes = PROJECT_EVENT_TYPES;
