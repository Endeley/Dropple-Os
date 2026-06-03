'use client';

import { useCallback, useMemo, useRef } from 'react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
    getProjectPerspectiveDefinition,
    listProjectPerspectiveIds,
} from '@/platform/workspaces/projectPerspectiveRouter.js';
import { useDispatcher } from '@/runtime/boundary/DispatcherContext.jsx';
import {
    applyBlueprintUpgradeFromCatalog,
    createProjectFromBlueprintCatalog,
    listBlueprintInstallOptions,
    listBlueprintUpgradeTargets,
    previewBlueprintUpgradeFromCatalog,
    resolveProjectBlueprintRouteSelection,
} from '@/ui/bridges/blueprintInstallBridge.js';
import { dispatchOsWorkspaceShellIntent } from '@/ui/bridges/osSurfaceIntentBridge.js';
import { readOsSurfaceSnapshot } from '@/ui/bridges/osSurfaceReadBridge.js';
import { resolveProjectIdentityFromProjection } from '@/ui/bridges/projectIdentityReadBridge.js';
import { useWorkspaceProjectionState } from '@/runtime/projection';
import { useCommandPalette } from '@/commands/useCommandPalette';
import { CommandPalette } from '@/commands/CommandPalette';
import {
    normalizeProjectCameraState,
    resolveProjectCameraFromSearchParams,
    resolveProjectUniverseFocusFromSearchParams,
    withProjectCameraSearchParams,
    withProjectUniverseFocusSearchParams,
} from '@/runtime/workspaces/projectViewRouteState.js';
import {
    buildProjectViewShareHref,
    getProjectShellRecentViewsStorageKey,
    mergeRecentProjectRoutes,
    normalizeRecentProjectRoutes,
} from '@/runtime/workspaces/projectShellRouteState.js';
import { buildProjectUniverseProjection } from '@/runtime/workspaces/projectUniverseProjection.js';
import {
    buildProjectUniverseNavigatorItems,
    resolveProjectUniverseFocusTarget,
} from '@/runtime/workspaces/projectUniverseNavigation.js';
import { buildCreatePerspectiveWorkflow } from '@/runtime/workspaces/createPerspectiveWorkflow.js';
import { buildBuildPerspectiveWorkflow } from '@/runtime/workspaces/buildPerspectiveWorkflow.js';
import { buildCollaboratePerspectiveWorkflow } from '@/runtime/workspaces/collaboratePerspectiveWorkflow.js';
import { resolveCreateAssistantActionLabels } from '@/runtime/workspaces/createAssistantActionLabels.js';
import { resolveBuildAssistantActionLabels } from '@/runtime/workspaces/buildAssistantActionLabels.js';
import { resolveOperateAssistantActionLabels } from '@/runtime/workspaces/operateAssistantActionLabels.js';
import { resolvePublishAssistantActionLabels } from '@/runtime/workspaces/publishAssistantActionLabels.js';
import { ProjectUniverseCanvas } from './ProjectUniverseCanvas.jsx';

function formatEntryLabel(entryId) {
    const override = {
        uiux: 'UI / UX',
        ai: 'AI',
    }[String(entryId).toLowerCase()];
    if (override) return override;
    return String(entryId)
        .split('-')
        .map((part) => (part ? part[0].toUpperCase() + part.slice(1) : part))
        .join(' ');
}

function formatShortHash(value) {
    if (typeof value !== 'string' || value.length < 12) return 'n/a';
    return `${value.slice(0, 12)}…`;
}

function summarizeWorkspaceProfiles(workspaceProfiles) {
    const entries = Object.entries(workspaceProfiles ?? {}).filter(([, modes]) => Array.isArray(modes) && modes.length > 0);
    if (entries.length === 0) return 'none';
    return entries
        .map(([profile, modes]) => `${profile}:${modes.join('|')}`)
        .join(' · ');
}

function buildPerspectiveEntrySummary(perspectiveIds) {
    const summary = [];
    for (const id of perspectiveIds) {
        const definition = getProjectPerspectiveDefinition(id);
        if (!definition) continue;
        summary.push(
            Object.freeze({
                perspectiveId: id,
                label: definition.label,
                entryCount: Array.isArray(definition.entries) ? definition.entries.length : 0,
            }),
        );
    }
    return summary;
}

async function copyTextWithFallback(text) {
    if (navigator?.clipboard?.writeText) {
        try {
            await navigator.clipboard.writeText(text);
            return;
        } catch {
            // Fallback handled below.
        }
    }
    window.prompt('Copy project view URL', text);
}

function navigateProjectWorkflowHref(router, href) {
    if (typeof window !== 'undefined') {
        window.location.assign(href);
        return;
    }
    router.push(href);
}

function isSameCameraState(left, right) {
    return (
        Number(left?.x ?? 0) === Number(right?.x ?? 0) &&
        Number(left?.y ?? 0) === Number(right?.y ?? 0) &&
        Number(left?.scale ?? 1) === Number(right?.scale ?? 1)
    );
}

export function ProjectPerspectiveShell({
    projectPerspectiveContext = null,
    activeModeId = null,
    children = null,
}) {
    if (!projectPerspectiveContext) return children;

    const router = useRouter();
    const dispatcher = useDispatcher();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const perspectiveId = projectPerspectiveContext.perspectiveId;
    const perspectiveLabel = projectPerspectiveContext.perspectiveLabel;
    const activeContextLabel = `${perspectiveLabel} > ${formatEntryLabel(projectPerspectiveContext.entryId)}`;
    const perspectiveIds = listProjectPerspectiveIds();
    const perspectiveDefinition = getProjectPerspectiveDefinition(perspectiveId);
    const perspectiveEntries = perspectiveDefinition?.entries ?? [];
    const { open: commandOpen, close: commandClose } = useCommandPalette({ enabled: true });
    const [navigatorQuery, setNavigatorQuery] = useState('');
    const [recentRoutes, setRecentRoutes] = useState(() => []);

    const activeRoute = `/workspace/${perspectiveId}?entry=${projectPerspectiveContext.entryId}`;
    const [cameraRouteState, setCameraRouteState] = useState(() => resolveProjectCameraFromSearchParams(searchParams));
    const [universeFocusState, setUniverseFocusState] = useState(() =>
        resolveProjectUniverseFocusFromSearchParams(searchParams),
    );
    const [createUtilityPanel, setCreateUtilityPanel] = useState('project');
    const [shareFeedback, setShareFeedback] = useState('');
    const [blueprintOptions] = useState(() => listBlueprintInstallOptions());
    const [selectedBlueprintIds, setSelectedBlueprintIds] = useState(() =>
        blueprintOptions[0]?.id ? [blueprintOptions[0].id] : [],
    );
    const [blueprintInstallStatus, setBlueprintInstallStatus] = useState('');
    const [blueprintInstallError, setBlueprintInstallError] = useState('');
    const [blueprintInstalling, setBlueprintInstalling] = useState(false);
    const [selectedUpgradeVersionId, setSelectedUpgradeVersionId] = useState('');
    const [upgradePreview, setUpgradePreview] = useState(null);
    const [upgradeStatus, setUpgradeStatus] = useState('');
    const [upgradeError, setUpgradeError] = useState('');
    const [upgradeApplying, setUpgradeApplying] = useState(false);
    const [assistantIntentStatus, setAssistantIntentStatus] = useState('');
    const osSurfaceSnapshot = readOsSurfaceSnapshot({
        perspectiveId: projectPerspectiveContext.perspectiveId,
        entryId: projectPerspectiveContext.entryId,
    });
    const assistantSurface = osSurfaceSnapshot?.assistants ?? null;
    const persistedProjectBootstrap = useWorkspaceProjectionState(
        (state) => state?.document?.meta?.projectBootstrap ?? null,
    );
    const projectedDocument = useWorkspaceProjectionState((state) => state?.document ?? null);
    const projectedEvents = useWorkspaceProjectionState((state) => state?.events ?? []);
    const projectIdentity = useMemo(
        () =>
            resolveProjectIdentityFromProjection({
                document: projectedDocument,
                events: projectedEvents,
            }),
        [projectedDocument, projectedEvents],
    );
    const projectUniverse = useMemo(
        () =>
            buildProjectUniverseProjection({
                document: projectedDocument,
                projectIdentity,
            }),
        [projectIdentity, projectedDocument],
    );
    const routeBootstrapAttemptedRef = useRef(false);
    const routeBlueprintSelection = useMemo(
        () =>
            resolveProjectBlueprintRouteSelection({
                searchParams,
                installOptions: blueprintOptions,
            }),
        [searchParams, blueprintOptions],
    );

    useEffect(() => {
        if (!routeBlueprintSelection || routeBlueprintSelection.blueprintIds.length === 0) return;
        setSelectedBlueprintIds(routeBlueprintSelection.blueprintIds);
    }, [routeBlueprintSelection]);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        try {
            const raw = window.localStorage.getItem(getProjectShellRecentViewsStorageKey());
            if (!raw) return;
            const cleaned = normalizeRecentProjectRoutes(JSON.parse(raw));
            if (cleaned.length > 0) {
                setRecentRoutes(cleaned);
            }
        } catch {
            // fail-closed: keep runtime-only list
        }
    }, []);

    useEffect(() => {
        setRecentRoutes((previous) => mergeRecentProjectRoutes({ activeRoute, previousRoutes: previous }));
    }, [activeRoute]);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        try {
            const normalized = normalizeRecentProjectRoutes(recentRoutes);
            window.localStorage.setItem(getProjectShellRecentViewsStorageKey(), JSON.stringify(normalized));
        } catch {
            // fail-closed: persistence is optional
        }
    }, [recentRoutes]);

    useEffect(() => {
        setCameraRouteState(resolveProjectCameraFromSearchParams(searchParams));
        setUniverseFocusState(resolveProjectUniverseFocusFromSearchParams(searchParams));
    }, [searchParams]);

    useEffect(() => {
        const nextQuery = universeFocusState.query ?? '';
        if (nextQuery === navigatorQuery) return;
        setNavigatorQuery(nextQuery);
    }, [navigatorQuery, universeFocusState.query]);

    const replaceShellSearchParams = useCallback((nextSearchParams) => {
        const href = `${pathname}?${nextSearchParams.toString()}`;
        if (typeof window !== 'undefined') {
            window.history.replaceState(window.history.state, '', href);
            return;
        }
        router.replace(href, { scroll: false });
    }, [pathname, router]);

    const getLiveShellSearchParams = useCallback(() =>
        typeof window !== 'undefined'
            ? new URLSearchParams(window.location.search)
            : new URLSearchParams(searchParams?.toString?.() ?? ''),
    [searchParams]);

    const handleCameraChange = useCallback((camera) => {
        const nextState = normalizeProjectCameraState(camera);
        setCameraRouteState((current) => (isSameCameraState(current, nextState) ? current : nextState));

        if (isSameCameraState(cameraRouteState, nextState)) {
            return;
        }

        const withCamera = withProjectCameraSearchParams({
            searchParams: getLiveShellSearchParams(),
            camera: nextState,
        });
        const next = withProjectUniverseFocusSearchParams({
            searchParams: withCamera,
            focus: universeFocusState,
        });
        replaceShellSearchParams(next);
    }, [cameraRouteState, getLiveShellSearchParams, replaceShellSearchParams, universeFocusState]);

    const replaceUniverseRouteState = useCallback(({ camera = cameraRouteState, focus = universeFocusState } = {}) => {
        const baseSearchParams = getLiveShellSearchParams();
        const withCamera = withProjectCameraSearchParams({
            searchParams: baseSearchParams,
            camera,
        });
        const next = withProjectUniverseFocusSearchParams({
            searchParams: withCamera,
            focus,
        });
        replaceShellSearchParams(next);
    }, [cameraRouteState, getLiveShellSearchParams, replaceShellSearchParams, universeFocusState]);

    const handleUniverseFocusTarget = (targetId) => {
        const focusTarget = resolveProjectUniverseFocusTarget({
            universe: projectUniverse,
            targetId,
        });
        if (!focusTarget) return;
        const nextCamera = normalizeProjectCameraState({
            x: -focusTarget.x,
            y: -focusTarget.y,
            scale: focusTarget.scale,
        });
        const nextFocus = Object.freeze({
            targetId: focusTarget.id,
            query: navigatorQuery,
        });
        setCameraRouteState(nextCamera);
        setUniverseFocusState(nextFocus);
        replaceUniverseRouteState({ camera: nextCamera, focus: nextFocus });
    };

    const shareCurrentView = async () => {
        const href = buildProjectViewShareHref({ pathname, searchParams });
        const absolute =
            typeof window !== 'undefined' ? `${window.location.origin}${href}` : href;
        await copyTextWithFallback(absolute);
        setShareFeedback('Copied');
        window.setTimeout(() => setShareFeedback(''), 1400);
    };

    const clearRecentViews = () => {
        setRecentRoutes([]);
        if (typeof window !== 'undefined') {
            try {
                window.localStorage.removeItem(getProjectShellRecentViewsStorageKey());
            } catch {
                // fail-closed: local persistence is optional
            }
        }
    };

    const installSelectedBlueprint = async (overrideBlueprintIds = null) => {
        const installIds =
            Array.isArray(overrideBlueprintIds) && overrideBlueprintIds.length > 0
                ? overrideBlueprintIds
                : selectedBlueprintIds;
        if (installIds.length === 0 || blueprintInstalling) return;
        setBlueprintInstallError('');
        setBlueprintInstallStatus('');
        setBlueprintInstalling(true);
        try {
            const selectedOptions = blueprintOptions.filter((option) => installIds.includes(option.id));
            const primaryBlueprintId = installIds[0];
            const projectId = `project.${installIds.join('-')}`;
            const projectName = installIds.join(' + ')
                .split('.')
                .map((part) => formatEntryLabel(part))
                .join(' ');
            const result = await createProjectFromBlueprintCatalog({
                dispatcher,
                blueprintEntries: selectedOptions.map((option) =>
                    Object.freeze({
                        blueprintId: option.id,
                        blueprintVersionId: option.versionId,
                        certificationHash: option.certificationHash,
                    }),
                ),
                projectId,
                projectName,
                defaultPerspectiveId: perspectiveId,
            });
            setBlueprintInstallStatus(
                result.composed
                    ? `Installed composed blueprint (${result.appliedEvents.length} events)`
                    : `Installed ${primaryBlueprintId} (${result.appliedEvents.length} events)`,
            );
            router.refresh();
        } catch (error) {
            setBlueprintInstallError(error instanceof Error ? error.message : String(error));
        } finally {
            setBlueprintInstalling(false);
        }
    };

    useEffect(() => {
        if (routeBootstrapAttemptedRef.current) return;
        if (!routeBlueprintSelection?.autoBootstrap) return;
        if (!routeBlueprintSelection.blueprintIds.length) return;
        if (persistedProjectBootstrap) return;
        routeBootstrapAttemptedRef.current = true;
        void installSelectedBlueprint(routeBlueprintSelection.blueprintIds);
    }, [routeBlueprintSelection, persistedProjectBootstrap]);

    const selectedBlueprintOptions = useMemo(
        () => blueprintOptions.filter((option) => selectedBlueprintIds.includes(option.id)),
        [blueprintOptions, selectedBlueprintIds],
    );
    const perspectiveEntrySummary = useMemo(
        () => buildPerspectiveEntrySummary(perspectiveIds),
        [perspectiveIds],
    );
    const totalPerspectiveEntries = useMemo(
        () => perspectiveEntrySummary.reduce((sum, item) => sum + item.entryCount, 0),
        [perspectiveEntrySummary],
    );
    const upgradeTargets = useMemo(
        () => listBlueprintUpgradeTargets({ projectBootstrap: persistedProjectBootstrap }),
        [persistedProjectBootstrap],
    );

    useEffect(() => {
        if (upgradeTargets.length === 0) {
            setSelectedUpgradeVersionId('');
            setUpgradePreview(null);
            return;
        }
        setSelectedUpgradeVersionId((previous) =>
            upgradeTargets.some((target) => target.versionId === previous)
                ? previous
                : upgradeTargets[0].versionId,
        );
    }, [upgradeTargets]);

    useEffect(() => {
        if (!selectedUpgradeVersionId) {
            setUpgradePreview(null);
            return;
        }
        try {
            const preview = previewBlueprintUpgradeFromCatalog({
                projectBootstrap: persistedProjectBootstrap,
                targetBlueprintVersionId: selectedUpgradeVersionId,
            });
            setUpgradePreview(preview);
            setUpgradeError('');
        } catch (error) {
            setUpgradePreview(null);
            setUpgradeError(error instanceof Error ? error.message : String(error));
        }
    }, [persistedProjectBootstrap, selectedUpgradeVersionId]);

    const applyUpgrade = async () => {
        if (!selectedUpgradeVersionId || upgradeApplying) return;
        setUpgradeApplying(true);
        setUpgradeStatus('');
        setUpgradeError('');
        try {
            const result = await applyBlueprintUpgradeFromCatalog({
                dispatcher,
                projectBootstrap: persistedProjectBootstrap,
                targetBlueprintVersionId: selectedUpgradeVersionId,
            });
            setUpgradeStatus(
                `Upgraded ${result.fromVersionId} → ${result.toVersionId} (${result.addedCount} events)`,
            );
            router.refresh();
        } catch (error) {
            setUpgradeError(error instanceof Error ? error.message : String(error));
        } finally {
            setUpgradeApplying(false);
        }
    };

    const perspectiveCommands = useMemo(() => {
        const commands = [];

        for (const id of perspectiveIds) {
            const definition = getProjectPerspectiveDefinition(id);
            if (!definition) continue;
            commands.push({
                id: `perspective:${id}`,
                title: `Go to ${definition.label}`,
                category: 'Perspective',
                keywords: ['project', 'perspective', id, definition.label],
                run: () => router.push(`/workspace/${id}`),
            });
            for (const entryId of definition.entries ?? []) {
                commands.push({
                    id: `entry:${id}:${entryId}`,
                    title: `Open ${definition.label} / ${formatEntryLabel(entryId)}`,
                    category: 'Entry',
                    keywords: ['project', 'entry', id, entryId, definition.label],
                    run: () => router.push(`/workspace/${id}?entry=${entryId}`),
                });
            }
        }

        return commands;
    }, [router, perspectiveIds]);

    const navigatorItems = useMemo(() => {
        const all = [];
        for (const id of perspectiveIds) {
            const definition = getProjectPerspectiveDefinition(id);
            if (!definition) continue;
            for (const entryId of definition.entries ?? []) {
                all.push(
                    Object.freeze({
                        id: `${id}:${entryId}`,
                        perspectiveId: id,
                        perspectiveLabel: definition.label,
                        entryId,
                        label: `${definition.label} / ${formatEntryLabel(entryId)}`,
                        href: `/workspace/${id}?entry=${entryId}`,
                    }),
                );
            }
        }
        const normalizedQuery = navigatorQuery.trim().toLowerCase();
        if (!normalizedQuery) return all;
        return all.filter(
            (item) =>
                item.label.toLowerCase().includes(normalizedQuery) ||
                item.perspectiveId.includes(normalizedQuery) ||
                item.entryId.includes(normalizedQuery),
        );
    }, [navigatorQuery, perspectiveIds]);
    const universeNavigatorItems = useMemo(
        () =>
            buildProjectUniverseNavigatorItems({
                universe: projectUniverse,
                query: navigatorQuery,
            }),
        [navigatorQuery, projectUniverse],
    );
    const createWorkflow = useMemo(
        () =>
            buildCreatePerspectiveWorkflow({
                universe: projectUniverse,
                activeEntryId: projectPerspectiveContext.entryId,
            }),
        [projectPerspectiveContext.entryId, projectUniverse],
    );
    const buildWorkflow = useMemo(
        () =>
            buildBuildPerspectiveWorkflow({
                universe: projectUniverse,
                activeEntryId: projectPerspectiveContext.entryId,
            }),
        [projectPerspectiveContext.entryId, projectUniverse],
    );
    const collaborateWorkflow = useMemo(
        () =>
            buildCollaboratePerspectiveWorkflow({
                universe: projectUniverse,
                activeEntryId: projectPerspectiveContext.entryId,
            }),
        [projectPerspectiveContext.entryId, projectUniverse],
    );
    const createAssistantLabels = useMemo(
        () =>
            perspectiveId === 'create'
                ? resolveCreateAssistantActionLabels(projectPerspectiveContext.entryId)
                : null,
        [perspectiveId, projectPerspectiveContext.entryId],
    );
    const buildAssistantLabels = useMemo(
        () =>
            perspectiveId === 'build'
                ? resolveBuildAssistantActionLabels(projectPerspectiveContext.entryId)
                : null,
        [perspectiveId, projectPerspectiveContext.entryId],
    );
    const operateAssistantLabels = useMemo(
        () =>
            perspectiveId === 'operate'
                ? resolveOperateAssistantActionLabels(projectPerspectiveContext.entryId)
                : null,
        [perspectiveId, projectPerspectiveContext.entryId],
    );
    const publishAssistantLabels = useMemo(
        () =>
            perspectiveId === 'publish'
                ? resolvePublishAssistantActionLabels(projectPerspectiveContext.entryId)
                : null,
        [perspectiveId, projectPerspectiveContext.entryId],
    );
    const isCreatePerspective = perspectiveId === 'create';

    const requestAssistantPlaceholder = async (assistantAction) => {
        const result = await dispatchOsWorkspaceShellIntent(
            {
                action: 'assistant.request',
                assistantId: assistantSurface?.activeAssistantId,
                assistantAction,
                perspectiveId,
                assistantInput: {
                    perspectiveId,
                    entryId: projectPerspectiveContext.entryId,
                },
            },
            dispatcher,
        );
        setAssistantIntentStatus(result.ok ? `enqueued:${result.requestId}` : result.reason ?? 'unknown');
        window.setTimeout(() => setAssistantIntentStatus(''), 1400);
    };

    return (
        <div style={{ display: 'grid', gridTemplateRows: 'auto auto auto 1fr', height: '100%' }}>
            {commandOpen && (
                <CommandPalette
                    commands={perspectiveCommands}
                    context={{
                        selected: [],
                        mode: activeModeId ?? projectPerspectiveContext.modeId,
                        readOnly: false,
                        authenticated: true,
                    }}
                    onClose={commandClose}
                />
            )}
            <header
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 10,
                    padding: '12px 16px',
                    borderBottom: '1px solid #e2e8f0',
                    background: 'linear-gradient(135deg, #fff7ed 0%, #ffffff 52%, #ecfeff 100%)',
                }}>
                <div style={{ display: 'grid', gap: 2 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                padding: '4px 8px',
                                borderRadius: 999,
                                fontSize: 10,
                                fontWeight: 700,
                                letterSpacing: '0.08em',
                                textTransform: 'uppercase',
                                color: '#9a3412',
                                background: '#ffedd5',
                                border: '1px solid #fdba74',
                            }}>
                            Project
                        </span>
                        <strong style={{ fontSize: 18, color: '#0f172a' }}>{activeContextLabel}</strong>
                    </div>
                    <span style={{ fontSize: 12, color: '#475569' }}>
                        Active context: {activeContextLabel}
                    </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 11, color: '#64748b' }}>
                        runtime: {projectPerspectiveContext.workspaceId}/{activeModeId ?? projectPerspectiveContext.modeId}
                    </span>
                    <button
                        type='button'
                        onClick={shareCurrentView}
                        style={{
                            border: '1px solid #cbd5e1',
                            borderRadius: 7,
                            background: '#ffffff',
                            color: '#334155',
                            fontSize: 11,
                            padding: '3px 9px',
                            cursor: 'pointer',
                        }}>
                        Share View
                    </button>
                    {shareFeedback ? (
                        <span style={{ fontSize: 11, color: '#0f766e' }}>{shareFeedback}</span>
                    ) : null}
                </div>
            </header>
            <nav
                aria-label='Project perspectives'
                style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 6,
                    padding: '10px 14px',
                    borderBottom: '1px solid #e2e8f0',
                    background: '#fffaf5',
                }}>
                {perspectiveIds.map((id) => {
                    const active = id === perspectiveId;
                    const definition = getProjectPerspectiveDefinition(id);
                    return (
                        <Link
                            key={id}
                            href={`/workspace/${id}`}
                            style={{
                                padding: '8px 12px',
                                borderRadius: 999,
                                fontSize: 12,
                                fontWeight: 600,
                                textDecoration: 'none',
                                border: `1px solid ${active ? '#0f172a' : '#fed7aa'}`,
                                color: active ? '#ffffff' : '#7c2d12',
                                background: active ? '#0f172a' : '#ffffff',
                                boxShadow: active ? '0 8px 24px rgba(15, 23, 42, 0.16)' : 'none',
                            }}>
                            {definition?.label ?? formatEntryLabel(id)}
                        </Link>
                    );
                })}
            </nav>
            <nav
                aria-label={`${perspectiveLabel} entries`}
                style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 6,
                    padding: '8px 14px',
                    borderBottom: '1px solid #e2e8f0',
                    background: '#ffffff',
                }}>
                {perspectiveEntries.map((entryId) => {
                    const active = entryId === projectPerspectiveContext.entryId;
                    return (
                        <Link
                            key={entryId}
                            href={`/workspace/${perspectiveId}?entry=${entryId}`}
                            style={{
                                padding: '4px 8px',
                                borderRadius: 8,
                                fontSize: 11,
                                textDecoration: 'none',
                                border: `1px solid ${active ? '#0f172a' : '#d1d5db'}`,
                                color: active ? '#0f172a' : '#475569',
                                background: active ? '#e2e8f0' : '#ffffff',
                            }}>
                            {formatEntryLabel(entryId)}
                        </Link>
                    );
                })}
            </nav>
            <div style={{ minHeight: 0, display: 'grid', gridTemplateRows: 'auto 1fr' }}>
                <ProjectUniverseCanvas
                    perspectiveId={perspectiveId}
                    universe={projectUniverse}
                    initialCamera={cameraRouteState}
                    onCameraChange={handleCameraChange}
                    focusedTargetId={universeFocusState.targetId}
                    onFocusTarget={handleUniverseFocusTarget}
                />
                <div
                    style={{
                        minHeight: 0,
                        display: 'grid',
                        gridTemplateColumns: isCreatePerspective ? '248px minmax(0, 1fr)' : '280px minmax(0, 1fr)',
                    }}>
                    <aside
                        style={{
                            borderRight: '1px solid #e2e8f0',
                            background: '#ffffff',
                            minHeight: 0,
                            overflow: 'auto',
                        }}>
                        {isCreatePerspective ? null : (
                        <>
                        <div style={{ padding: 10, borderBottom: '1px solid #e2e8f0' }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>
                                Navigator
                            </div>
                            <input
                                aria-label='Navigator search'
                                value={navigatorQuery}
                                onChange={(event) => {
                                    const query = event.target.value;
                                    setNavigatorQuery(query);
                                    const nextFocus = Object.freeze({
                                        targetId: universeFocusState.targetId,
                                        query,
                                    });
                                    setUniverseFocusState(nextFocus);
                                    replaceUniverseRouteState({ focus: nextFocus });
                                }}
                                placeholder='Search entries, groups, or artifacts'
                                style={{
                                    width: '100%',
                                    border: '1px solid #cbd5e1',
                                    borderRadius: 6,
                                    padding: '6px 8px',
                                    fontSize: 12,
                                }}
                            />
                        </div>
                        </>
                        )}
                        {isCreatePerspective ? null : (
                        <>
                        <div style={{ padding: 10, borderBottom: '1px solid #e2e8f0' }}>
                            {perspectiveId === 'overview' ? (
                                <div
                                    data-testid='project-hub-panel'
                                    style={{
                                        border: '1px solid #e2e8f0',
                                        borderRadius: 8,
                                        padding: 8,
                                        background: '#f8fafc',
                                        display: 'grid',
                                        gap: 6,
                                        marginBottom: 10,
                                    }}>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: '#0f172a' }}>
                                        Project Hub
                                    </div>
                                    <div style={{ fontSize: 10, color: '#334155' }}>
                                        perspectives: {perspectiveEntrySummary.length}
                                    </div>
                                    <div style={{ fontSize: 10, color: '#334155' }}>
                                        entries: {totalPerspectiveEntries}
                                    </div>
                                    <div style={{ fontSize: 10, color: '#334155' }}>
                                        recent views: {recentRoutes.length}
                                    </div>
                                    <div style={{ fontSize: 10, color: '#334155' }}>
                                        projectId: {projectIdentity.projectId ?? 'none'}
                                    </div>
                                    <div style={{ fontSize: 10, color: '#334155' }}>
                                        project name: {projectIdentity.name}
                                    </div>
                                    <div style={{ fontSize: 10, color: '#334155' }}>
                                        blueprintId: {projectIdentity.blueprintId ?? 'none'}
                                    </div>
                                    <div style={{ fontSize: 10, color: '#334155' }}>
                                        owner: {projectIdentity.owner ?? 'none'}
                                    </div>
                                    <div style={{ fontSize: 10, color: '#334155' }}>
                                        updatedAt: {projectIdentity.updatedAt ?? 'none'}
                                    </div>
                                    <div style={{ fontSize: 10, color: '#334155' }}>
                                        bootstrap:{' '}
                                        {persistedProjectBootstrap?.blueprintVersionId
                                            ? persistedProjectBootstrap.blueprintVersionId
                                            : 'none'}
                                    </div>
                                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                        <Link
                                            href='/workspace/create'
                                            style={{ fontSize: 10, color: '#0f172a', textDecoration: 'none' }}>
                                            Open Create
                                        </Link>
                                        <Link
                                            href='/workspace/build'
                                            style={{ fontSize: 10, color: '#0f172a', textDecoration: 'none' }}>
                                            Open Build
                                        </Link>
                                        <Link
                                            href='/workspace/publish'
                                            style={{ fontSize: 10, color: '#0f172a', textDecoration: 'none' }}>
                                            Open Publish
                                        </Link>
                                    </div>
                                </div>
                            ) : null}
                            <div style={{ fontSize: 11, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                                Start from Blueprint
                            </div>
                            <div style={{ display: 'grid', gap: 6 }}>
                                <select
                                    aria-label='Blueprint chooser'
                                    multiple
                                    value={selectedBlueprintIds}
                                    onChange={(event) => {
                                        const next = Array.from(event.target.selectedOptions).map(
                                            (option) => option.value,
                                        );
                                        setSelectedBlueprintIds(next);
                                    }}
                                    style={{
                                        width: '100%',
                                        border: '1px solid #cbd5e1',
                                        borderRadius: 6,
                                        padding: '6px 8px',
                                        fontSize: 12,
                                        background: '#ffffff',
                                        minHeight: 94,
                                    }}>
                                    {blueprintOptions.map((option) => (
                                        <option key={option.id} value={option.id}>
                                            {option.name} ({option.versionId})
                                        </option>
                                    ))}
                                </select>
                                {selectedBlueprintOptions.length > 0 ? (
                                    <div
                                        style={{
                                            border: '1px solid #e2e8f0',
                                            borderRadius: 6,
                                            padding: '6px 8px',
                                            background: '#f8fafc',
                                            display: 'grid',
                                            gap: 4,
                                        }}>
                                        <span style={{ fontSize: 10, color: '#334155' }}>
                                            selected: {selectedBlueprintOptions.length}
                                        </span>
                                        <span style={{ fontSize: 10, color: '#334155' }}>
                                            ids: {selectedBlueprintOptions.map((option) => option.id).join(', ')}
                                        </span>
                                        <span style={{ fontSize: 10, color: '#334155' }}>
                                            cert: {formatShortHash(selectedBlueprintOptions[0]?.certificationHash)}
                                        </span>
                                        <span style={{ fontSize: 10, color: '#334155' }}>
                                            seed events:{' '}
                                            {selectedBlueprintOptions.reduce(
                                                (sum, option) => sum + option.seedEventCount,
                                                0,
                                            )}
                                        </span>
                                        <span style={{ fontSize: 10, color: '#334155' }}>
                                            profiles:{' '}
                                            {selectedBlueprintOptions
                                                .map((option) =>
                                                    summarizeWorkspaceProfiles(option.workspaceProfiles),
                                                )
                                                .join(' + ')}
                                        </span>
                                    </div>
                                ) : null}
                                <button
                                    type='button'
                                    onClick={installSelectedBlueprint}
                                    disabled={blueprintInstalling || selectedBlueprintIds.length === 0}
                                    style={{
                                        border: '1px solid #334155',
                                        borderRadius: 6,
                                        background: blueprintInstalling ? '#cbd5e1' : '#0f172a',
                                        color: '#ffffff',
                                        fontSize: 11,
                                        padding: '6px 8px',
                                        cursor: blueprintInstalling ? 'not-allowed' : 'pointer',
                                    }}>
                                    {blueprintInstalling
                                        ? 'Installing…'
                                        : selectedBlueprintIds.length > 1
                                          ? 'Install Composed Blueprint'
                                          : 'Install Blueprint'}
                                </button>
                                {blueprintInstallStatus ? (
                                    <span style={{ fontSize: 11, color: '#0f766e' }}>{blueprintInstallStatus}</span>
                                ) : null}
                                {blueprintInstallError ? (
                                    <span style={{ fontSize: 11, color: '#b91c1c' }}>{blueprintInstallError}</span>
                                ) : null}
                            </div>
                        </div>
                        </>
                        )}
                        {perspectiveId === 'create' ? (
                            <div style={{ padding: 10, borderBottom: '1px solid #e2e8f0' }}>
                                <div style={{ fontSize: 11, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                                    Create Workflow
                                </div>
                                <div
                                    data-testid='create-workflow-panel'
                                    style={{
                                        border: '1px solid #e2e8f0',
                                        borderRadius: 8,
                                        padding: 8,
                                        background: '#f8fafc',
                                        display: 'grid',
                                        gap: 8,
                                    }}>
                                    {createWorkflow.suggestedNextArtifact ? (
                                        <button
                                            type='button'
                                            onClick={() =>
                                                navigateProjectWorkflowHref(
                                                    router,
                                                    createWorkflow.suggestedNextArtifact.href,
                                                )
                                            }
                                            data-testid='create-workflow-suggested-next'
                                            style={{
                                                textAlign: 'left',
                                                border: '1px solid #fdba74',
                                                borderRadius: 8,
                                                background: '#fff7ed',
                                                color: '#7c2d12',
                                                padding: '8px 10px',
                                                cursor: 'pointer',
                                                display: 'grid',
                                                gap: 2,
                                            }}>
                                            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                                                Continue Creating
                                            </span>
                                            <strong style={{ fontSize: 12, color: '#9a3412' }}>
                                                {createWorkflow.suggestedNextArtifact.label}
                                            </strong>
                                            <span style={{ fontSize: 10 }}>
                                                {createWorkflow.suggestedNextArtifact.clusterLabel} · {createWorkflow.suggestedNextArtifact.entryLabel}
                                            </span>
                                        </button>
                                    ) : null}
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                        {createWorkflow.entrySummaries.map((summary) => (
                                            <span
                                                key={summary.entryId}
                                                style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: 4,
                                                    border: '1px solid #cbd5e1',
                                                    borderRadius: 999,
                                                    background: '#ffffff',
                                                    color: '#334155',
                                                    fontSize: 10,
                                                    padding: '3px 7px',
                                                }}>
                                                {summary.entryLabel}
                                                <strong style={{ color: '#0f172a' }}>{summary.count}</strong>
                                            </span>
                                        ))}
                                    </div>
                                    <div style={{ display: 'grid', gap: 8 }}>
                                        {createWorkflow.artifactClusters.map((cluster) => (
                                            <div key={cluster.clusterId} data-testid={`create-workflow-cluster-${cluster.clusterId}`}>
                                                <div
                                                    style={{
                                                        fontSize: 10,
                                                        fontWeight: 700,
                                                        color: '#475569',
                                                        marginBottom: 4,
                                                        letterSpacing: '0.04em',
                                                        textTransform: 'uppercase',
                                                    }}>
                                                    {cluster.clusterLabel}
                                                </div>
                                                <div style={{ display: 'grid', gap: 4 }}>
                                                    {cluster.items.map((item) => (
                                                        <button
                                                            key={item.targetId}
                                                            type='button'
                                                            onClick={() => navigateProjectWorkflowHref(router, item.href)}
                                                            data-testid={`create-workflow-link-${item.targetId}`}
                                                            style={{
                                                                display: 'grid',
                                                                gap: 2,
                                                                textAlign: 'left',
                                                                border: `1px solid ${item.active ? '#0f172a' : '#e2e8f0'}`,
                                                                borderRadius: 6,
                                                                background: '#ffffff',
                                                                color: '#334155',
                                                                padding: '6px 8px',
                                                                cursor: 'pointer',
                                                            }}>
                                                            <strong style={{ fontSize: 11, color: '#0f172a' }}>{item.label}</strong>
                                                            <span style={{ fontSize: 10, color: '#64748b' }}>
                                                                {item.entryLabel} · {item.kind}
                                                            </span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                        {createWorkflow.linkedArtifacts.length === 0 ? (
                                            <span style={{ fontSize: 11, color: '#64748b' }}>
                                                No linked create artifacts
                                            </span>
                                        ) : null}
                                    </div>
                                </div>
                            </div>
                        ) : null}
                        {perspectiveId === 'build' ? (
                            <div style={{ padding: 10, borderBottom: '1px solid #e2e8f0' }}>
                                <div style={{ fontSize: 11, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                                    Build Workflow
                                </div>
                                <div
                                    data-testid='build-workflow-panel'
                                    style={{
                                        border: '1px solid #e2e8f0',
                                        borderRadius: 8,
                                        padding: 8,
                                        background: '#f8fafc',
                                        display: 'grid',
                                        gap: 8,
                                    }}>
                                    {buildWorkflow.suggestedNextArtifact ? (
                                        <button
                                            type='button'
                                            onClick={() =>
                                                navigateProjectWorkflowHref(
                                                    router,
                                                    buildWorkflow.suggestedNextArtifact.href,
                                                )
                                            }
                                            data-testid='build-workflow-suggested-next'
                                            style={{
                                                textAlign: 'left',
                                                border: '1px solid #93c5fd',
                                                borderRadius: 8,
                                                background: '#eff6ff',
                                                color: '#1d4ed8',
                                                padding: '8px 10px',
                                                cursor: 'pointer',
                                                display: 'grid',
                                                gap: 2,
                                            }}>
                                            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                                                Continue Building
                                            </span>
                                            <strong style={{ fontSize: 12, color: '#1d4ed8' }}>
                                                {buildWorkflow.suggestedNextArtifact.label}
                                            </strong>
                                            <span style={{ fontSize: 10 }}>
                                                {buildWorkflow.suggestedNextArtifact.clusterLabel} · {buildWorkflow.suggestedNextArtifact.entryLabel}
                                            </span>
                                        </button>
                                    ) : null}
                                    {buildWorkflow.operateHandoff ? (
                                        <button
                                            type='button'
                                            onClick={() => navigateProjectWorkflowHref(router, buildWorkflow.operateHandoff.href)}
                                            data-testid='build-workflow-operate-handoff'
                                            style={{
                                                textAlign: 'left',
                                                border: '1px solid #86efac',
                                                borderRadius: 8,
                                                background: '#f0fdf4',
                                                color: '#166534',
                                                padding: '8px 10px',
                                                cursor: 'pointer',
                                                display: 'grid',
                                                gap: 2,
                                            }}>
                                            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                                                Hand Off To Operate
                                            </span>
                                            <strong style={{ fontSize: 12, color: '#166534' }}>
                                                {buildWorkflow.operateHandoff.label}
                                            </strong>
                                            <span style={{ fontSize: 10 }}>
                                                {buildWorkflow.operateHandoff.entryLabel}
                                            </span>
                                        </button>
                                    ) : null}
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                        {buildWorkflow.entrySummaries.map((summary) => (
                                            <span
                                                key={summary.entryId}
                                                style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: 4,
                                                    border: '1px solid #cbd5e1',
                                                    borderRadius: 999,
                                                    background: '#ffffff',
                                                    color: '#334155',
                                                    fontSize: 10,
                                                    padding: '3px 7px',
                                                }}>
                                                {summary.entryLabel}
                                                <strong style={{ color: '#0f172a' }}>{summary.count}</strong>
                                            </span>
                                        ))}
                                    </div>
                                    <div style={{ display: 'grid', gap: 8 }}>
                                        {buildWorkflow.artifactClusters.map((cluster) => (
                                            <div key={cluster.clusterId} data-testid={`build-workflow-cluster-${cluster.clusterId}`}>
                                                <div
                                                    style={{
                                                        fontSize: 10,
                                                        fontWeight: 700,
                                                        color: '#475569',
                                                        marginBottom: 4,
                                                        letterSpacing: '0.04em',
                                                        textTransform: 'uppercase',
                                                    }}>
                                                    {cluster.clusterLabel}
                                                </div>
                                                <div style={{ display: 'grid', gap: 4 }}>
                                                    {cluster.items.map((item) => (
                                                        <button
                                                            key={item.targetId}
                                                            type='button'
                                                            onClick={() => navigateProjectWorkflowHref(router, item.href)}
                                                            data-testid={`build-workflow-link-${item.targetId}`}
                                                            style={{
                                                                display: 'grid',
                                                                gap: 2,
                                                                textAlign: 'left',
                                                                border: `1px solid ${item.active ? '#0f172a' : '#e2e8f0'}`,
                                                                borderRadius: 6,
                                                                background: '#ffffff',
                                                                color: '#334155',
                                                                padding: '6px 8px',
                                                                cursor: 'pointer',
                                                            }}>
                                                            <strong style={{ fontSize: 11, color: '#0f172a' }}>{item.label}</strong>
                                                            <span style={{ fontSize: 10, color: '#64748b' }}>
                                                                {item.entryLabel} · {item.kind}
                                                            </span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                        {buildWorkflow.linkedArtifacts.length === 0 ? (
                                            <span style={{ fontSize: 11, color: '#64748b' }}>
                                                No linked build artifacts
                                            </span>
                                        ) : null}
                                    </div>
                                </div>
                            </div>
                        ) : null}
                        {perspectiveId === 'collaborate' ? (
                            <div style={{ padding: 10, borderBottom: '1px solid #e2e8f0' }}>
                                <div style={{ fontSize: 11, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                                    Collaborate Workflow
                                </div>
                                <div
                                    data-testid='collaborate-workflow-panel'
                                    style={{
                                        border: '1px solid #e2e8f0',
                                        borderRadius: 8,
                                        padding: 8,
                                        background: '#f8fafc',
                                        display: 'grid',
                                        gap: 8,
                                    }}>
                                    {collaborateWorkflow.suggestedNextArtifact ? (
                                        <button
                                            type='button'
                                            onClick={() =>
                                                navigateProjectWorkflowHref(
                                                    router,
                                                    collaborateWorkflow.suggestedNextArtifact.href,
                                                )
                                            }
                                            data-testid='collaborate-workflow-suggested-next'
                                            style={{
                                                textAlign: 'left',
                                                border: '1px solid #c4b5fd',
                                                borderRadius: 8,
                                                background: '#f5f3ff',
                                                color: '#6d28d9',
                                                padding: '8px 10px',
                                                cursor: 'pointer',
                                                display: 'grid',
                                                gap: 2,
                                            }}>
                                            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                                                Continue Collaborating
                                            </span>
                                            <strong style={{ fontSize: 12, color: '#6d28d9' }}>
                                                {collaborateWorkflow.suggestedNextArtifact.label}
                                            </strong>
                                            <span style={{ fontSize: 10 }}>
                                                {collaborateWorkflow.suggestedNextArtifact.clusterLabel} · {collaborateWorkflow.suggestedNextArtifact.entryLabel}
                                            </span>
                                        </button>
                                    ) : null}
                                    {collaborateWorkflow.publishHandoff ? (
                                        <button
                                            type='button'
                                            onClick={() => navigateProjectWorkflowHref(router, collaborateWorkflow.publishHandoff.href)}
                                            data-testid='collaborate-workflow-publish-handoff'
                                            style={{
                                                textAlign: 'left',
                                                border: '1px solid #fcd34d',
                                                borderRadius: 8,
                                                background: '#fefce8',
                                                color: '#a16207',
                                                padding: '8px 10px',
                                                cursor: 'pointer',
                                                display: 'grid',
                                                gap: 2,
                                            }}>
                                            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                                                Hand Off To Publish
                                            </span>
                                            <strong style={{ fontSize: 12, color: '#a16207' }}>
                                                {collaborateWorkflow.publishHandoff.label}
                                            </strong>
                                            <span style={{ fontSize: 10 }}>
                                                {collaborateWorkflow.publishHandoff.entryLabel}
                                            </span>
                                        </button>
                                    ) : null}
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                        {collaborateWorkflow.entrySummaries.map((summary) => (
                                            <span
                                                key={summary.entryId}
                                                style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: 4,
                                                    border: '1px solid #cbd5e1',
                                                    borderRadius: 999,
                                                    background: '#ffffff',
                                                    color: '#334155',
                                                    fontSize: 10,
                                                    padding: '3px 7px',
                                                }}>
                                                {summary.entryLabel}
                                                <strong style={{ color: '#0f172a' }}>{summary.count}</strong>
                                            </span>
                                        ))}
                                    </div>
                                    <div style={{ display: 'grid', gap: 8 }}>
                                        {collaborateWorkflow.artifactClusters.map((cluster) => (
                                            <div key={cluster.clusterId} data-testid={`collaborate-workflow-cluster-${cluster.clusterId}`}>
                                                <div
                                                    style={{
                                                        fontSize: 10,
                                                        fontWeight: 700,
                                                        color: '#475569',
                                                        marginBottom: 4,
                                                        letterSpacing: '0.04em',
                                                        textTransform: 'uppercase',
                                                    }}>
                                                    {cluster.clusterLabel}
                                                </div>
                                                <div style={{ display: 'grid', gap: 4 }}>
                                                    {cluster.items.map((item) => (
                                                        <button
                                                            key={`${item.targetId}:${item.entryId}`}
                                                            type='button'
                                                            onClick={() => navigateProjectWorkflowHref(router, item.href)}
                                                            data-testid={`collaborate-workflow-link-${item.targetId}-${item.entryId}`}
                                                            style={{
                                                                display: 'grid',
                                                                gap: 2,
                                                                textAlign: 'left',
                                                                border: `1px solid ${item.active ? '#0f172a' : '#e2e8f0'}`,
                                                                borderRadius: 6,
                                                                background: '#ffffff',
                                                                color: '#334155',
                                                                padding: '6px 8px',
                                                                cursor: 'pointer',
                                                            }}>
                                                            <strong style={{ fontSize: 11, color: '#0f172a' }}>{item.label}</strong>
                                                            <span style={{ fontSize: 10, color: '#64748b' }}>
                                                                {item.entryLabel} · {item.kind}
                                                            </span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                        {collaborateWorkflow.linkedArtifacts.length === 0 ? (
                                            <span style={{ fontSize: 11, color: '#64748b' }}>
                                                No linked collaborate artifacts
                                            </span>
                                        ) : null}
                                    </div>
                                </div>
                            </div>
                        ) : null}
                        <div style={{ padding: 10, borderBottom: '1px solid #e2e8f0' }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                                Assistants
                            </div>
                            <div
                                data-testid='assistant-surface-panel'
                                style={{
                                    border: '1px solid #e2e8f0',
                                    borderRadius: 6,
                                    padding: '6px 8px',
                                    background: '#f8fafc',
                                    display: 'grid',
                                    gap: 4,
                                }}>
                                <span style={{ fontSize: 10, color: '#334155' }}>
                                    perspective: {assistantSurface?.perspectiveId ?? 'n/a'}
                                </span>
                                <span style={{ fontSize: 10, color: '#334155' }}>
                                    adapter: {assistantSurface?.adapterLabel ?? 'none'}
                                </span>
                                <span style={{ fontSize: 10, color: '#334155' }}>
                                    active: {assistantSurface?.activeAssistantId ?? 'none'}
                                </span>
                                {createAssistantLabels || buildAssistantLabels || operateAssistantLabels || publishAssistantLabels ? (
                                    <span
                                        data-testid='assistant-surface-focus'
                                        style={{ fontSize: 10, color: '#334155' }}>
                                        focus: {(createAssistantLabels ?? buildAssistantLabels ?? operateAssistantLabels ?? publishAssistantLabels).assistantLabel} for {formatEntryLabel(projectPerspectiveContext.entryId)}
                                    </span>
                                ) : null}
                                <span style={{ fontSize: 10, color: '#334155' }}>
                                    visible: {(assistantSurface?.assistantIds ?? []).join(', ') || 'none'}
                                </span>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                    <button
                                        type='button'
                                        onClick={() => requestAssistantPlaceholder('recommend')}
                                        data-testid='assistant-action-recommend'
                                        disabled={!assistantSurface?.activeAssistantId}
                                        style={{
                                            border: '1px solid #cbd5e1',
                                            borderRadius: 6,
                                            background: '#ffffff',
                                            color: '#334155',
                                            fontSize: 10,
                                            padding: '4px 6px',
                                            cursor: assistantSurface?.activeAssistantId ? 'pointer' : 'not-allowed',
                                        }}>
                                        {createAssistantLabels?.recommendLabel ?? buildAssistantLabels?.recommendLabel ?? operateAssistantLabels?.recommendLabel ?? publishAssistantLabels?.recommendLabel ?? 'Ask Assistant'}
                                    </button>
                                    <button
                                        type='button'
                                        onClick={() => requestAssistantPlaceholder('generate')}
                                        data-testid='assistant-action-generate'
                                        disabled={!assistantSurface?.activeAssistantId}
                                        style={{
                                            border: '1px solid #cbd5e1',
                                            borderRadius: 6,
                                            background: '#ffffff',
                                            color: '#334155',
                                            fontSize: 10,
                                            padding: '4px 6px',
                                            cursor: assistantSurface?.activeAssistantId ? 'pointer' : 'not-allowed',
                                        }}>
                                        {createAssistantLabels?.generateLabel ?? buildAssistantLabels?.generateLabel ?? operateAssistantLabels?.generateLabel ?? publishAssistantLabels?.generateLabel ?? 'Generate Options'}
                                    </button>
                                    <button
                                        type='button'
                                        onClick={() => requestAssistantPlaceholder('explain')}
                                        data-testid='assistant-action-explain'
                                        disabled={!assistantSurface?.activeAssistantId}
                                        style={{
                                            border: '1px solid #cbd5e1',
                                            borderRadius: 6,
                                            background: '#ffffff',
                                            color: '#334155',
                                            fontSize: 10,
                                            padding: '4px 6px',
                                            cursor: assistantSurface?.activeAssistantId ? 'pointer' : 'not-allowed',
                                        }}>
                                        {createAssistantLabels?.explainLabel ?? buildAssistantLabels?.explainLabel ?? operateAssistantLabels?.explainLabel ?? publishAssistantLabels?.explainLabel ?? 'Improve This'}
                                    </button>
                                </div>
                                {assistantIntentStatus ? (
                                    <span style={{ fontSize: 10, color: '#64748b' }}>
                                        assistant intent: {assistantIntentStatus}
                                    </span>
                                ) : null}
                            </div>
                        </div>
                        {isCreatePerspective ? (
                            <div
                                data-testid='create-shell-utility-panel'
                                style={{ padding: 10, borderBottom: '1px solid #e2e8f0', display: 'grid', gap: 8 }}>
                                <div style={{ fontSize: 11, fontWeight: 700, color: '#334155' }}>Create Studio</div>
                                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                    {[
                                        { id: 'project', label: 'Project' },
                                        { id: 'navigate', label: 'Navigate' },
                                        { id: 'blueprints', label: 'Blueprints' },
                                    ].map((tab) => {
                                        const active = createUtilityPanel === tab.id;
                                        return (
                                            <button
                                                key={tab.id}
                                                type='button'
                                                data-testid={`create-shell-utility-tab-${tab.id}`}
                                                onClick={() => setCreateUtilityPanel(tab.id)}
                                                style={{
                                                    border: `1px solid ${active ? '#0f172a' : '#cbd5e1'}`,
                                                    borderRadius: 999,
                                                    background: active ? '#0f172a' : '#ffffff',
                                                    color: active ? '#ffffff' : '#334155',
                                                    fontSize: 10,
                                                    padding: '4px 8px',
                                                    cursor: 'pointer',
                                                }}>
                                                {tab.label}
                                            </button>
                                        );
                                    })}
                                </div>
                                {createUtilityPanel === 'project' ? (
                                    <div style={{ display: 'grid', gap: 8 }}>
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                gap: 8,
                                                marginBottom: 6,
                                            }}>
                                            <div style={{ fontSize: 11, fontWeight: 700, color: '#334155' }}>Recent</div>
                                            <button
                                                type='button'
                                                onClick={clearRecentViews}
                                                style={{
                                                    border: '1px solid #d1d5db',
                                                    borderRadius: 6,
                                                    background: '#ffffff',
                                                    color: '#475569',
                                                    fontSize: 10,
                                                    padding: '2px 6px',
                                                    cursor: 'pointer',
                                                }}>
                                                Clear
                                            </button>
                                        </div>
                                        <div style={{ display: 'grid', gap: 4 }}>
                                            {recentRoutes.length === 0 ? (
                                                <span style={{ fontSize: 11, color: '#64748b' }}>No recent routes</span>
                                            ) : (
                                                recentRoutes.map((href) => (
                                                    <Link
                                                        key={href}
                                                        href={href}
                                                        style={{
                                                            fontSize: 11,
                                                            color: href === activeRoute ? '#0f172a' : '#334155',
                                                            textDecoration: 'none',
                                                            padding: '4px 6px',
                                                            borderRadius: 6,
                                                            background: href === activeRoute ? '#e2e8f0' : 'transparent',
                                                        }}>
                                                        {href.replace('/workspace/', '')}
                                                    </Link>
                                                ))
                                            )}
                                        </div>
                                        <div style={{ fontSize: 11, fontWeight: 700, color: '#334155', marginTop: 4 }}>
                                            Universe
                                        </div>
                                        <div style={{ display: 'grid', gap: 4 }}>
                                            {universeNavigatorItems.map((item) => {
                                                const active = item.targetId === universeFocusState.targetId;
                                                return (
                                                    <button
                                                        key={item.id}
                                                        type='button'
                                                        data-testid={`project-universe-nav-${item.targetId}`}
                                                        onClick={() => handleUniverseFocusTarget(item.targetId)}
                                                        style={{
                                                            textAlign: 'left',
                                                            border: `1px solid ${active ? '#0f172a' : '#e2e8f0'}`,
                                                            borderRadius: 6,
                                                            background: active ? '#f8fafc' : '#ffffff',
                                                            color: '#334155',
                                                            padding: '6px 8px',
                                                            cursor: 'pointer',
                                                        }}>
                                                        <div style={{ fontSize: 11, fontWeight: 600 }}>{item.label}</div>
                                                        <div style={{ fontSize: 10, color: '#64748b' }}>
                                                            {item.targetType} · {item.subtitle}
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                            {universeNavigatorItems.length === 0 ? (
                                                <span style={{ fontSize: 11, color: '#64748b' }}>No universe matches</span>
                                            ) : null}
                                        </div>
                                    </div>
                                ) : null}
                                {createUtilityPanel === 'navigate' ? (
                                    <div style={{ display: 'grid', gap: 8 }}>
                                        <input
                                            aria-label='Navigator search'
                                            value={navigatorQuery}
                                            onChange={(event) => {
                                                const query = event.target.value;
                                                setNavigatorQuery(query);
                                                const nextFocus = Object.freeze({
                                                    targetId: universeFocusState.targetId,
                                                    query,
                                                });
                                                setUniverseFocusState(nextFocus);
                                                replaceUniverseRouteState({ focus: nextFocus });
                                            }}
                                            placeholder='Search entries, groups, or artifacts'
                                            style={{
                                                width: '100%',
                                                border: '1px solid #cbd5e1',
                                                borderRadius: 6,
                                                padding: '6px 8px',
                                                fontSize: 12,
                                            }}
                                        />
                                        <div style={{ fontSize: 11, fontWeight: 700, color: '#334155' }}>
                                            All Entries
                                        </div>
                                        <div style={{ display: 'grid', gap: 4 }}>
                                            {navigatorItems.map((item) => {
                                                const active = item.href === activeRoute;
                                                return (
                                                    <Link
                                                        key={item.id}
                                                        href={item.href}
                                                        style={{
                                                            fontSize: 11,
                                                            color: active ? '#0f172a' : '#334155',
                                                            textDecoration: 'none',
                                                            padding: '4px 6px',
                                                            borderRadius: 6,
                                                            border: `1px solid ${active ? '#0f172a' : '#e2e8f0'}`,
                                                            background: active ? '#f8fafc' : '#ffffff',
                                                        }}>
                                                        {item.label}
                                                    </Link>
                                                );
                                            })}
                                            {navigatorItems.length === 0 ? (
                                                <span style={{ fontSize: 11, color: '#64748b' }}>No matches</span>
                                            ) : null}
                                        </div>
                                    </div>
                                ) : null}
                                {createUtilityPanel === 'blueprints' ? (
                                    <div style={{ display: 'grid', gap: 8 }}>
                                        <div style={{ fontSize: 11, fontWeight: 700, color: '#334155' }}>
                                            Start from Blueprint
                                        </div>
                                        <select
                                            aria-label='Blueprint chooser'
                                            multiple
                                            value={selectedBlueprintIds}
                                            onChange={(event) => {
                                                const next = Array.from(event.target.selectedOptions).map(
                                                    (option) => option.value,
                                                );
                                                setSelectedBlueprintIds(next);
                                            }}
                                            style={{
                                                width: '100%',
                                                border: '1px solid #cbd5e1',
                                                borderRadius: 6,
                                                padding: '6px 8px',
                                                fontSize: 12,
                                                background: '#ffffff',
                                                minHeight: 94,
                                            }}>
                                            {blueprintOptions.map((option) => (
                                                <option key={option.id} value={option.id}>
                                                    {option.name} ({option.versionId})
                                                </option>
                                            ))}
                                        </select>
                                        <button
                                            type='button'
                                            onClick={installSelectedBlueprint}
                                            disabled={blueprintInstalling || selectedBlueprintIds.length === 0}
                                            style={{
                                                border: '1px solid #334155',
                                                borderRadius: 6,
                                                background: blueprintInstalling ? '#cbd5e1' : '#0f172a',
                                                color: '#ffffff',
                                                fontSize: 11,
                                                padding: '6px 8px',
                                                cursor: blueprintInstalling ? 'not-allowed' : 'pointer',
                                            }}>
                                            {blueprintInstalling
                                                ? 'Installing…'
                                                : selectedBlueprintIds.length > 1
                                                  ? 'Install Composed Blueprint'
                                                  : 'Install Blueprint'}
                                        </button>
                                        <div style={{ fontSize: 11, fontWeight: 700, color: '#334155', marginTop: 4 }}>
                                            Bootstrap
                                        </div>
                                        {persistedProjectBootstrap ? (
                                            <div style={{ display: 'grid', gap: 4 }}>
                                                <span style={{ fontSize: 10, color: '#334155' }}>
                                                    projectId: {persistedProjectBootstrap.projectId ?? 'n/a'}
                                                </span>
                                                <span style={{ fontSize: 10, color: '#334155' }}>
                                                    blueprintId: {persistedProjectBootstrap.blueprintId ?? 'n/a'}
                                                </span>
                                                <span style={{ fontSize: 10, color: '#334155' }}>
                                                    blueprintVersion: {persistedProjectBootstrap.blueprintVersionId ?? 'n/a'}
                                                </span>
                                            </div>
                                        ) : (
                                            <span style={{ fontSize: 11, color: '#64748b' }}>No bootstrap metadata yet</span>
                                        )}
                                        <div style={{ fontSize: 11, fontWeight: 700, color: '#334155', marginTop: 4 }}>
                                            Upgrade Blueprint
                                        </div>
                                        {upgradeTargets.length === 0 ? (
                                            <span style={{ fontSize: 11, color: '#64748b' }}>No upgrade target available</span>
                                        ) : (
                                            <div style={{ display: 'grid', gap: 6 }}>
                                                <select
                                                    aria-label='Blueprint upgrade target'
                                                    value={selectedUpgradeVersionId}
                                                    onChange={(event) => setSelectedUpgradeVersionId(event.target.value)}
                                                    style={{
                                                        width: '100%',
                                                        border: '1px solid #cbd5e1',
                                                        borderRadius: 6,
                                                        padding: '6px 8px',
                                                        fontSize: 12,
                                                        background: '#ffffff',
                                                    }}>
                                                    {upgradeTargets.map((target) => (
                                                        <option key={target.versionId} value={target.versionId}>
                                                            {target.name} ({target.versionId})
                                                        </option>
                                                    ))}
                                                </select>
                                                <button
                                                    type='button'
                                                    onClick={applyUpgrade}
                                                    disabled={upgradeApplying || !upgradePreview?.canApply}
                                                    style={{
                                                        border: '1px solid #334155',
                                                        borderRadius: 6,
                                                        background: upgradeApplying ? '#cbd5e1' : '#0f172a',
                                                        color: '#ffffff',
                                                        fontSize: 11,
                                                        padding: '6px 8px',
                                                        cursor: upgradeApplying || !upgradePreview?.canApply ? 'not-allowed' : 'pointer',
                                                    }}>
                                                    {upgradeApplying ? 'Applying…' : 'Apply Upgrade'}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ) : null}
                            </div>
                        ) : null}
                        {isCreatePerspective ? null : (
                        <>
                        <div style={{ padding: 10, borderBottom: '1px solid #e2e8f0' }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                                Project Bootstrap Provenance
                            </div>
                            {persistedProjectBootstrap ? (
                                <div style={{ display: 'grid', gap: 4 }}>
                                    <span style={{ fontSize: 10, color: '#334155' }}>
                                        projectId: {persistedProjectBootstrap.projectId ?? 'n/a'}
                                    </span>
                                    <span style={{ fontSize: 10, color: '#334155' }}>
                                        projectName: {persistedProjectBootstrap.projectName ?? 'n/a'}
                                    </span>
                                    <span style={{ fontSize: 10, color: '#334155' }}>
                                        defaultPerspective: {persistedProjectBootstrap.defaultPerspectiveId ?? 'n/a'}
                                    </span>
                                    <span style={{ fontSize: 10, color: '#334155' }}>
                                        blueprintId: {persistedProjectBootstrap.blueprintId ?? 'n/a'}
                                    </span>
                                    <span style={{ fontSize: 10, color: '#334155' }}>
                                        blueprintVersion: {persistedProjectBootstrap.blueprintVersionId ?? 'n/a'}
                                    </span>
                                </div>
                            ) : (
                                <span style={{ fontSize: 11, color: '#64748b' }}>No bootstrap metadata yet</span>
                            )}
                        </div>
                        <div style={{ padding: 10, borderBottom: '1px solid #e2e8f0' }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                                Upgrade Blueprint
                            </div>
                            {upgradeTargets.length === 0 ? (
                                <span style={{ fontSize: 11, color: '#64748b' }}>No upgrade target available</span>
                            ) : (
                                <div style={{ display: 'grid', gap: 6 }}>
                                    <select
                                        aria-label='Blueprint upgrade target'
                                        value={selectedUpgradeVersionId}
                                        onChange={(event) => setSelectedUpgradeVersionId(event.target.value)}
                                        style={{
                                            width: '100%',
                                            border: '1px solid #cbd5e1',
                                            borderRadius: 6,
                                            padding: '6px 8px',
                                            fontSize: 12,
                                            background: '#ffffff',
                                        }}>
                                        {upgradeTargets.map((target) => (
                                            <option key={target.versionId} value={target.versionId}>
                                                {target.name} ({target.versionId})
                                            </option>
                                        ))}
                                    </select>
                                    {upgradePreview ? (
                                        <div
                                            style={{
                                                border: '1px solid #e2e8f0',
                                                borderRadius: 6,
                                                padding: '6px 8px',
                                                background: '#f8fafc',
                                                display: 'grid',
                                                gap: 4,
                                            }}>
                                            <span style={{ fontSize: 10, color: '#334155' }}>
                                                diff: +{upgradePreview.addedCount} / ~{upgradePreview.changedCount} / -{upgradePreview.removedCount}
                                            </span>
                                            <span style={{ fontSize: 10, color: '#334155' }}>
                                                additive: {String(upgradePreview.additive)}
                                            </span>
                                            <span style={{ fontSize: 10, color: '#334155' }}>
                                                merge policy: {String(upgradePreview.mergePolicyPassed)}
                                            </span>
                                            <span style={{ fontSize: 10, color: '#334155' }}>
                                                certification: {String(upgradePreview.certificationValid)}
                                            </span>
                                            <span style={{ fontSize: 10, color: '#334155' }}>
                                                can apply: {String(upgradePreview.canApply)}
                                            </span>
                                        </div>
                                    ) : null}
                                    <button
                                        type='button'
                                        onClick={applyUpgrade}
                                        disabled={upgradeApplying || !upgradePreview?.canApply}
                                        style={{
                                            border: '1px solid #334155',
                                            borderRadius: 6,
                                            background: upgradeApplying ? '#cbd5e1' : '#0f172a',
                                            color: '#ffffff',
                                            fontSize: 11,
                                            padding: '6px 8px',
                                            cursor: upgradeApplying || !upgradePreview?.canApply ? 'not-allowed' : 'pointer',
                                        }}>
                                        {upgradeApplying ? 'Applying…' : 'Apply Upgrade'}
                                    </button>
                                    {upgradeStatus ? (
                                        <span style={{ fontSize: 11, color: '#0f766e' }}>{upgradeStatus}</span>
                                    ) : null}
                                    {upgradeError ? (
                                        <span style={{ fontSize: 11, color: '#b91c1c' }}>{upgradeError}</span>
                                    ) : null}
                                </div>
                            )}
                        </div>
                        <div style={{ padding: 10, borderBottom: '1px solid #e2e8f0' }}>
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: 8,
                                    marginBottom: 6,
                                }}>
                                <div style={{ fontSize: 11, fontWeight: 700, color: '#334155' }}>Recent</div>
                                <button
                                    type='button'
                                    onClick={clearRecentViews}
                                    style={{
                                        border: '1px solid #d1d5db',
                                        borderRadius: 6,
                                        background: '#ffffff',
                                        color: '#475569',
                                        fontSize: 10,
                                        padding: '2px 6px',
                                        cursor: 'pointer',
                                    }}>
                                    Clear
                                </button>
                            </div>
                            <div style={{ display: 'grid', gap: 4 }}>
                                {recentRoutes.length === 0 ? (
                                    <span style={{ fontSize: 11, color: '#64748b' }}>No recent routes</span>
                                ) : (
                                    recentRoutes.map((href) => (
                                        <Link
                                            key={href}
                                            href={href}
                                            style={{
                                                fontSize: 11,
                                                color: href === activeRoute ? '#0f172a' : '#334155',
                                                textDecoration: 'none',
                                                padding: '4px 6px',
                                                borderRadius: 6,
                                                background: href === activeRoute ? '#e2e8f0' : 'transparent',
                                            }}>
                                            {href.replace('/workspace/', '')}
                                        </Link>
                                    ))
                                )}
                            </div>
                        </div>
                        <div style={{ padding: 10 }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                                Universe
                            </div>
                            <div style={{ display: 'grid', gap: 4, marginBottom: 10 }}>
                                {universeNavigatorItems.map((item) => {
                                    const active = item.targetId === universeFocusState.targetId;
                                    return (
                                        <button
                                            key={item.id}
                                            type='button'
                                            data-testid={`project-universe-nav-${item.targetId}`}
                                            onClick={() => handleUniverseFocusTarget(item.targetId)}
                                            style={{
                                                textAlign: 'left',
                                                border: `1px solid ${active ? '#0f172a' : '#e2e8f0'}`,
                                                borderRadius: 6,
                                                background: active ? '#f8fafc' : '#ffffff',
                                                color: '#334155',
                                                padding: '6px 8px',
                                                cursor: 'pointer',
                                            }}>
                                            <div style={{ fontSize: 11, fontWeight: 600 }}>{item.label}</div>
                                            <div style={{ fontSize: 10, color: '#64748b' }}>
                                                {item.targetType} · {item.subtitle}
                                            </div>
                                        </button>
                                    );
                                })}
                                {universeNavigatorItems.length === 0 ? (
                                    <span style={{ fontSize: 11, color: '#64748b' }}>No universe matches</span>
                                ) : null}
                            </div>
                            <div style={{ fontSize: 11, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                                All Entries
                            </div>
                            <div style={{ display: 'grid', gap: 4 }}>
                                {navigatorItems.map((item) => {
                                    const active = item.href === activeRoute;
                                    return (
                                        <Link
                                            key={item.id}
                                            href={item.href}
                                            style={{
                                                fontSize: 11,
                                                color: active ? '#0f172a' : '#334155',
                                                textDecoration: 'none',
                                                padding: '4px 6px',
                                                borderRadius: 6,
                                                border: `1px solid ${active ? '#0f172a' : '#e2e8f0'}`,
                                                background: active ? '#f8fafc' : '#ffffff',
                                            }}>
                                            {item.label}
                                        </Link>
                                    );
                                })}
                                {navigatorItems.length === 0 ? (
                                    <span style={{ fontSize: 11, color: '#64748b' }}>No matches</span>
                                ) : null}
                            </div>
                        </div>
                        </>
                        )}
                    </aside>
                    <div style={{ minHeight: 0 }}>{children}</div>
                </div>
            </div>
        </div>
    );
}
