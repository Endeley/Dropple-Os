'use client';

import { useMemo, useRef } from 'react';
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
import { readOsSurfaceSnapshot } from '@/ui/bridges/osSurfaceReadBridge.js';
import { useWorkspaceProjectionState } from '@/runtime/projection';
import { useCommandPalette } from '@/commands/useCommandPalette';
import { CommandPalette } from '@/commands/CommandPalette';
import {
    normalizeProjectCameraState,
    resolveProjectCameraFromSearchParams,
    withProjectCameraSearchParams,
} from '@/runtime/workspaces/projectViewRouteState.js';
import {
    buildProjectViewShareHref,
    getProjectShellRecentViewsStorageKey,
    mergeRecentProjectRoutes,
    normalizeRecentProjectRoutes,
} from '@/runtime/workspaces/projectShellRouteState.js';
import { ProjectUniverseCanvas } from './ProjectUniverseCanvas.jsx';

function formatEntryLabel(entryId) {
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
    const perspectiveIds = listProjectPerspectiveIds();
    const perspectiveDefinition = getProjectPerspectiveDefinition(perspectiveId);
    const perspectiveEntries = perspectiveDefinition?.entries ?? [];
    const { open: commandOpen, close: commandClose } = useCommandPalette({ enabled: true });
    const [navigatorQuery, setNavigatorQuery] = useState('');
    const [recentRoutes, setRecentRoutes] = useState(() => []);

    const activeRoute = `/workspace/${perspectiveId}?entry=${projectPerspectiveContext.entryId}`;
    const [cameraRouteState, setCameraRouteState] = useState(() => resolveProjectCameraFromSearchParams(searchParams));
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
    const osSurfaceSnapshot = readOsSurfaceSnapshot();
    const assistantSurface = osSurfaceSnapshot?.assistants ?? null;
    const persistedProjectBootstrap = useWorkspaceProjectionState(
        (state) => state?.document?.meta?.projectBootstrap ?? null,
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
    }, [searchParams]);

    const handleCameraChange = (camera) => {
        const nextState = normalizeProjectCameraState(camera);
        setCameraRouteState(nextState);

        const next = withProjectCameraSearchParams({
            searchParams,
            camera: nextState,
        });
        router.replace(`${pathname}?${next.toString()}`, { scroll: false });
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
                    padding: '10px 14px',
                    borderBottom: '1px solid #e2e8f0',
                    background: '#ffffff',
                }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <strong style={{ fontSize: 14, color: '#0f172a' }}>Project Space</strong>
                    <span style={{ fontSize: 12, color: '#475569' }}>
                        {perspectiveLabel} · {projectPerspectiveContext.entryId}
                    </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 11, color: '#64748b' }}>
                        workspace: {projectPerspectiveContext.workspaceId}/
                        {activeModeId ?? projectPerspectiveContext.modeId}
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
                    padding: '8px 12px',
                    borderBottom: '1px solid #e2e8f0',
                    background: '#f8fafc',
                }}>
                {perspectiveIds.map((id) => {
                    const active = id === perspectiveId;
                    return (
                        <Link
                            key={id}
                            href={`/workspace/${id}`}
                            style={{
                                padding: '6px 10px',
                                borderRadius: 999,
                                fontSize: 12,
                                textDecoration: 'none',
                                border: `1px solid ${active ? '#0f172a' : '#cbd5e1'}`,
                                color: active ? '#ffffff' : '#334155',
                                background: active ? '#0f172a' : '#ffffff',
                            }}>
                            {id}
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
                    padding: '8px 12px',
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
                    initialCamera={cameraRouteState}
                    onCameraChange={handleCameraChange}
                />
                <div style={{ minHeight: 0, display: 'grid', gridTemplateColumns: '280px minmax(0, 1fr)' }}>
                    <aside
                        style={{
                            borderRight: '1px solid #e2e8f0',
                            background: '#ffffff',
                            minHeight: 0,
                            overflow: 'auto',
                        }}>
                        <div style={{ padding: 10, borderBottom: '1px solid #e2e8f0' }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>
                                Navigator
                            </div>
                            <input
                                aria-label='Navigator search'
                                value={navigatorQuery}
                                onChange={(event) => setNavigatorQuery(event.target.value)}
                                placeholder='Search perspectives or entries'
                                style={{
                                    width: '100%',
                                    border: '1px solid #cbd5e1',
                                    borderRadius: 6,
                                    padding: '6px 8px',
                                    fontSize: 12,
                                }}
                            />
                        </div>
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
                                <span style={{ fontSize: 10, color: '#334155' }}>
                                    visible: {(assistantSurface?.assistantIds ?? []).join(', ') || 'none'}
                                </span>
                            </div>
                        </div>
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
                    </aside>
                    <div style={{ minHeight: 0 }}>{children}</div>
                </div>
            </div>
        </div>
    );
}
