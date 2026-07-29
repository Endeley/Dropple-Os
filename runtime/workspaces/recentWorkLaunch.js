import { getActiveDocument } from '../../infrastructure/persistence/activeDocument.js';
import { loadRegistry } from '../../infrastructure/persistence/documentRegistry.js';
import {
    applyWorkspaceLaunchContextToSearchParams,
    createWorkspaceLaunchContext,
} from './workspaceLaunchContext.js';

function asNonEmptyString(value) {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
}

function normalizeTimestamp(value) {
    return Number.isFinite(value) ? Number(value) : null;
}

function normalizeRecentDocumentEntry(entry) {
    if (!entry || typeof entry !== 'object') return null;

    const documentId = asNonEmptyString(entry.id ?? entry.documentId ?? entry.projectId);
    if (!documentId) return null;

    return Object.freeze({
        documentId,
        name: asNonEmptyString(entry.name) ?? 'Untitled',
        workspaceId: asNonEmptyString(entry.workspaceId),
        modeId: asNonEmptyString(entry.modeId ?? entry.language),
        updatedAt: normalizeTimestamp(entry.updatedAt),
    });
}

function sortRecentDocuments(recentDocuments = []) {
    if (!Array.isArray(recentDocuments)) return [];

    return recentDocuments
        .map(normalizeRecentDocumentEntry)
        .filter(Boolean)
        .sort((left, right) => {
            const leftUpdated = left.updatedAt ?? -1;
            const rightUpdated = right.updatedAt ?? -1;
            if (leftUpdated !== rightUpdated) return rightUpdated - leftUpdated;
            return left.documentId.localeCompare(right.documentId);
        });
}

export function resolveRecentWorkDocument({
    activeDocumentId = null,
    recentDocuments = [],
} = {}) {
    const normalizedActiveDocumentId = asNonEmptyString(activeDocumentId);
    const normalizedRecentDocuments = sortRecentDocuments(recentDocuments);

    if (normalizedActiveDocumentId) {
        const activeDocument = normalizedRecentDocuments.find(
            (entry) => entry.documentId === normalizedActiveDocumentId,
        );
        if (activeDocument) return activeDocument;
    }

    return normalizedRecentDocuments[0] ?? null;
}

export function createRecentWorkLaunchContext(recentDocument) {
    const normalizedDocument = normalizeRecentDocumentEntry(recentDocument);
    if (!normalizedDocument?.modeId) return null;

    return createWorkspaceLaunchContext({
        language: normalizedDocument.modeId,
        grammar: 'create',
    });
}

export function buildRecentWorkLaunchHref({
    activeDocumentId = null,
    recentDocuments = [],
} = {}) {
    const resolvedDocument = resolveRecentWorkDocument({
        activeDocumentId,
        recentDocuments,
    });

    if (!resolvedDocument) return '/workspace/overview';

    const searchParams = new URLSearchParams();
    searchParams.set('doc', resolvedDocument.documentId);

    const launchContext = createRecentWorkLaunchContext(resolvedDocument);
    const searchWithLaunchContext = applyWorkspaceLaunchContextToSearchParams({
        launchContext,
        searchParams,
    });

    return `/workspace/new?${searchWithLaunchContext.toString()}`;
}

export function buildStoredRecentWorkLaunchHref() {
    return buildRecentWorkLaunchHref({
        activeDocumentId: getActiveDocument(),
        recentDocuments: loadRegistry(),
    });
}
