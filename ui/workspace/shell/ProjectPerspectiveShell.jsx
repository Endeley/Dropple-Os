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
import { useWorkspaceVisualState } from '@/runtime/projection';
import { useCommandPalette } from '@/commands/useCommandPalette';
import { CommandPalette } from '@/commands/CommandPalette';
import {
    buildProjectArtifactContinuityHref,
    buildProjectWorldNavigationEnvelope,
    buildProjectWorldSessionBridgeKey,
    normalizeProjectCameraState,
    PROJECT_WORLD_NAVIGATION_STATE_KEY,
    resolveProjectCameraFromSearchParams,
    resolveProjectPerspectiveContinuityFromSearchParams,
    resolveProjectUniverseFocusFromSearchParams,
    withProjectDurableWorldSearchParams,
} from '@/runtime/workspaces/projectViewRouteState.js';
import {
    buildProjectViewShareHref,
    getProjectShellRecentViewsStorageKey,
    mergeRecentProjectRoutes,
    normalizeRecentProjectRoutes,
} from '@/runtime/workspaces/projectShellRouteState.js';
import { buildProjectUniverseProjection } from '@/runtime/workspaces/projectUniverseProjection.js';
import {
    buildProjectUniverseAnchoringSummary,
    buildProjectUniverseNavigatorItems,
    buildProjectUniverseOrientation,
    resolveProjectUniverseFocusTarget,
} from '@/runtime/workspaces/projectUniverseNavigation.js';
import {
    resolveProjectUniverseContinuityTarget,
    resolveProjectUniverseEditorHandoff,
} from '@/runtime/workspaces/projectUniverseEditorHandoff.js';
import { resolveProjectWorldAnchor } from '@/runtime/workspaces/projectWorldAnchor.js';
import { buildCreatePerspectiveWorkflow } from '@/runtime/workspaces/createPerspectiveWorkflow.js';
import { buildBuildPerspectiveWorkflow } from '@/runtime/workspaces/buildPerspectiveWorkflow.js';
import { buildOperatePerspectiveWorkflow } from '@/runtime/workspaces/buildOverlayWorkflow.js';
import { buildCollaboratePerspectiveWorkflow } from '@/runtime/workspaces/collaboratePerspectiveWorkflow.js';
import { resolveCollaborateShellChoreography } from '@/runtime/workspaces/collaborateShellChoreography.js';
import { resolveCreateAssistantActionLabels } from '@/runtime/workspaces/createAssistantActionLabels.js';
import { resolveBuildAssistantActionLabels } from '@/runtime/workspaces/buildAssistantActionLabels.js';
import { resolveOperateAssistantActionLabels } from '@/runtime/workspaces/operateAssistantActionLabels.js';
import { resolvePublishAssistantActionLabels } from '@/runtime/workspaces/publishAssistantActionLabels.js';
import {
    buildPublishPerspectiveWorkflow,
    buildPublishPerspectiveWorldSummary,
} from '@/runtime/workspaces/publishPerspectiveWorkflow.js';
import { resolveCreateShellChoreography } from '@/runtime/workspaces/createShellChoreography.js';
import { resolveBuildShellChoreography } from '@/runtime/workspaces/buildShellChoreography.js';
import { resolveOperateShellChoreography } from '@/runtime/workspaces/operateShellChoreography.js';
import { resolvePublishShellChoreography } from '@/runtime/workspaces/publishShellChoreography.js';
import { buildProjectUniverseWorkflowGuide } from '@/runtime/workspaces/projectUniverseWorkflowGuide.js';
import { buildProjectUniverseAtGlance } from '@/runtime/workspaces/projectUniverseAtGlance.js';
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

function formatArtifactKindLabel(kind) {
    if (typeof kind !== 'string' || kind.trim().length === 0) return 'Artifact';
    return kind
        .split('-')
        .map((part) => (part ? part[0].toUpperCase() + part.slice(1) : part))
        .join(' ');
}

function formatShortHash(value) {
    if (typeof value !== 'string' || value.length < 12) return 'n/a';
    return `${value.slice(0, 12)}…`;
}

function formatOptionalDate(value) {
    if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) return 'n/a';
    try {
        return new Date(value).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    } catch {
        return 'n/a';
    }
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

function isSameCameraState(left, right) {
    return (
        Number(left?.x ?? 0) === Number(right?.x ?? 0) &&
        Number(left?.y ?? 0) === Number(right?.y ?? 0) &&
        Number(left?.scale ?? 1) === Number(right?.scale ?? 1)
    );
}

function buildHref(pathname, searchParams) {
    const query = searchParams?.toString?.() ?? '';
    return query.length > 0 ? `${pathname}?${query}` : pathname;
}

function readProjectWorldEnvelopeFromHistoryState(historyState) {
    const envelope = historyState?.[PROJECT_WORLD_NAVIGATION_STATE_KEY];
    return envelope ? buildProjectWorldNavigationEnvelope(envelope) : null;
}

function mergeProjectWorldEnvelopeIntoHistoryState(historyState, envelope) {
    const nextState =
        historyState && typeof historyState === 'object' && !Array.isArray(historyState)
            ? { ...historyState }
            : {};
    nextState[PROJECT_WORLD_NAVIGATION_STATE_KEY] = envelope;
    return nextState;
}

function readProjectWorldEnvelopeFromSessionBridge({ pathname, searchParams, consume = false } = {}) {
    if (typeof window === 'undefined' || !window.sessionStorage) return null;
    const key = buildProjectWorldSessionBridgeKey({ pathname, searchParams });
    const raw = window.sessionStorage.getItem(key);
    if (!raw) return null;
    if (consume) {
        window.sessionStorage.removeItem(key);
    }
    try {
        return buildProjectWorldNavigationEnvelope(JSON.parse(raw));
    } catch {
        return null;
    }
}

function writeProjectWorldEnvelopeToSessionBridge({ href, envelope } = {}) {
    if (typeof window === 'undefined' || !window.sessionStorage || !href || !envelope) return;
    try {
        window.sessionStorage.setItem(
            buildProjectWorldSessionBridgeKey({ href }),
            JSON.stringify(envelope),
        );
    } catch {
        // fail-closed: continuity falls back to durable URL parsing
    }
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
    const [motionMode, setMotionMode] = useState('full');

    const activeRoute = `/workspace/${perspectiveId}?entry=${projectPerspectiveContext.entryId}`;
    const resolveRouteEnvelope = useCallback(({ consumeSessionBridge = false } = {}) => {
        const searchState = Object.freeze({
            camera: resolveProjectCameraFromSearchParams(searchParams),
            focus: resolveProjectUniverseFocusFromSearchParams(searchParams),
            continuity: resolveProjectPerspectiveContinuityFromSearchParams(searchParams),
        });

        if (typeof window === 'undefined') return searchState;

        const historyEnvelope = readProjectWorldEnvelopeFromHistoryState(window.history.state);
        if (historyEnvelope) return historyEnvelope;

        const bridgeSearchParams = withProjectDurableWorldSearchParams({
            searchParams,
            focus: searchState.focus,
            entryId: searchParams?.get?.('entry') ?? projectPerspectiveContext.entryId,
        });
        const pendingEnvelope = readProjectWorldEnvelopeFromSessionBridge({
            pathname,
            searchParams: bridgeSearchParams,
            consume: consumeSessionBridge,
        });
        return pendingEnvelope ?? searchState;
    }, [pathname, projectPerspectiveContext.entryId, searchParams]);
    const [cameraRouteState, setCameraRouteState] = useState(() => resolveProjectCameraFromSearchParams(searchParams));
    const cameraRouteStateRef = useRef(cameraRouteState);
    const searchParamsRef = useRef(searchParams);
    const [universeFocusState, setUniverseFocusState] = useState(() =>
        resolveProjectUniverseFocusFromSearchParams(searchParams),
    );
    const [perspectiveContinuityState, setPerspectiveContinuityState] = useState(() =>
        resolveProjectPerspectiveContinuityFromSearchParams(searchParams),
    );
    const [createUtilityPanel, setCreateUtilityPanel] = useState('support');
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
    const selectedIds = useWorkspaceVisualState((state) => state?.selection?.ids ?? []);
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
        const envelope = resolveRouteEnvelope({ consumeSessionBridge: true });
        if (typeof window !== 'undefined') {
            const nextHistoryState = mergeProjectWorldEnvelopeIntoHistoryState(window.history.state, envelope);
            window.history.replaceState(nextHistoryState, '', window.location.href);
        }
        setCameraRouteState((current) => (isSameCameraState(current, envelope.camera) ? current : envelope.camera));
        setUniverseFocusState(envelope.focus);
        setPerspectiveContinuityState(envelope.continuity);
    }, [resolveRouteEnvelope]);

    useEffect(() => {
        searchParamsRef.current = searchParams;
    }, [searchParams]);

    useEffect(() => {
        if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        const applyMotionMode = () => {
            setMotionMode(mediaQuery.matches ? 'reduced' : 'full');
        };
        applyMotionMode();

        if (typeof mediaQuery.addEventListener === 'function') {
            mediaQuery.addEventListener('change', applyMotionMode);
            return () => mediaQuery.removeEventListener('change', applyMotionMode);
        }

        mediaQuery.addListener(applyMotionMode);
        return () => mediaQuery.removeListener(applyMotionMode);
    }, []);

    const preserveExplicitCameraOnFocus = useMemo(
        () =>
            Boolean(
                searchParams?.get?.('x') ||
                searchParams?.get?.('y') ||
                searchParams?.get?.('z') ||
                readProjectWorldEnvelopeFromHistoryState(typeof window !== 'undefined' ? window.history.state : null),
            ),
        [searchParams],
    );

    useEffect(() => {
        const nextQuery = universeFocusState.query ?? '';
        if (nextQuery === navigatorQuery) return;
        setNavigatorQuery(nextQuery);
    }, [navigatorQuery, universeFocusState.query]);

    const replaceShellSearchParams = useCallback((nextSearchParams, envelope = null) => {
        const href = buildHref(pathname, nextSearchParams);
        if (typeof window !== 'undefined') {
            const nextHistoryState = envelope
                ? mergeProjectWorldEnvelopeIntoHistoryState(window.history.state, envelope)
                : window.history.state;
            window.history.replaceState(nextHistoryState, '', href);
            return;
        }
        router.replace(href, { scroll: false });
    }, [pathname, router]);

    const getLiveShellSearchParams = useCallback(
        () =>
            typeof window !== 'undefined'
                ? new URLSearchParams(window.location.search)
                : new URLSearchParams(searchParamsRef.current?.toString?.() ?? ''),
        [],
    );

    const buildDurableShellSearchParams = useCallback(({
        focus = universeFocusState,
        entryId = projectPerspectiveContext.entryId,
        searchParams: baseSearchParams = getLiveShellSearchParams(),
    } = {}) =>
        withProjectDurableWorldSearchParams({
            searchParams: baseSearchParams,
            focus,
            entryId,
        }),
    [getLiveShellSearchParams, projectPerspectiveContext.entryId, universeFocusState]);

    const writeNavigationEnvelopeForHref = useCallback(({ href, envelope } = {}) => {
        writeProjectWorldEnvelopeToSessionBridge({ href, envelope });
    }, []);

    useEffect(() => {
        cameraRouteStateRef.current = cameraRouteState;
    }, [cameraRouteState]);

    const handleCameraChange = useCallback((camera) => {
        const nextState = normalizeProjectCameraState(camera);
        let didChange = false;
        setCameraRouteState((current) => {
            if (isSameCameraState(current, nextState)) {
                return current;
            }
            didChange = true;
            cameraRouteStateRef.current = nextState;
            return nextState;
        });

        if (!didChange && isSameCameraState(cameraRouteStateRef.current, nextState)) {
            return;
        }

        const envelope = buildProjectWorldNavigationEnvelope({
            camera: nextState,
            focus: universeFocusState,
            continuity: perspectiveContinuityState,
        });
        const next = buildDurableShellSearchParams({
            focus: universeFocusState,
        });
        replaceShellSearchParams(next, envelope);
    }, [buildDurableShellSearchParams, perspectiveContinuityState, replaceShellSearchParams, universeFocusState]);

    const replaceUniverseRouteState = useCallback(({ camera = cameraRouteState, focus = universeFocusState } = {}) => {
        const envelope = buildProjectWorldNavigationEnvelope({
            camera,
            focus,
            continuity: perspectiveContinuityState,
        });
        const next = buildDurableShellSearchParams({
            searchParams: getLiveShellSearchParams(),
            focus,
        });
        replaceShellSearchParams(next, envelope);
    }, [buildDurableShellSearchParams, cameraRouteState, getLiveShellSearchParams, perspectiveContinuityState, replaceShellSearchParams, universeFocusState]);

    const buildPerspectiveNavigationTarget = useCallback((nextPerspectiveId) => {
        const targetDefinition = getProjectPerspectiveDefinition(nextPerspectiveId);
        const targetEntryId =
            nextPerspectiveId === perspectiveId
                ? projectPerspectiveContext.entryId
                : targetDefinition?.defaultEntryId ?? null;
        const search = withProjectDurableWorldSearchParams({
            searchParams: new URLSearchParams(),
            focus: universeFocusState,
            entryId: targetEntryId,
        });
        const href = buildHref(`/workspace/${nextPerspectiveId}`, search);
        const envelope = buildProjectWorldNavigationEnvelope({
            camera: cameraRouteState,
            focus: universeFocusState,
            continuity: {
                continuityKind: 'hop',
                fromPerspectiveId: perspectiveId,
                toPerspectiveId: nextPerspectiveId,
                sourceTargetId: universeFocusState.targetId ?? `perspective:${projectPerspectiveContext.entryId}`,
                sourceLabel: activeContextLabel,
                targetEntryId,
                sourceEntryId: projectPerspectiveContext.entryId,
            },
        });
        return Object.freeze({ href, envelope });
    }, [
        activeContextLabel,
        cameraRouteState,
        perspectiveId,
        projectPerspectiveContext.entryId,
        universeFocusState,
    ]);

    const transitionDescriptor = useMemo(() => {
        if (!perspectiveContinuityState.fromPerspectiveId) return null;
        if (perspectiveContinuityState.toPerspectiveId !== perspectiveId) return null;

        if (perspectiveContinuityState.sourceLabel) {
            if (perspectiveContinuityState.continuityKind === 'surface') {
                return `back to ${perspectiveContinuityState.sourceLabel}`;
            }
            if (perspectiveContinuityState.continuityKind === 'dive') {
                return `opened from ${perspectiveContinuityState.sourceLabel}`;
            }
            if (perspectiveContinuityState.continuityKind === 'hop') {
                return `moving from ${perspectiveContinuityState.sourceLabel}`;
            }
        }

        return `${formatEntryLabel(perspectiveContinuityState.fromPerspectiveId)} -> ${perspectiveLabel}`;
    }, [perspectiveContinuityState, perspectiveId, perspectiveLabel]);

    const projectIntentDescriptor = useMemo(() => {
        if (!perspectiveContinuityState.fromPerspectiveId) return null;
        if (perspectiveContinuityState.toPerspectiveId !== perspectiveId) return null;
        if (!perspectiveContinuityState.sourceIntentLabel) return null;
        return perspectiveContinuityState.sourceIntentLabel;
    }, [perspectiveContinuityState, perspectiveId]);

    const editorEmergenceState = useMemo(() => {
        if (perspectiveContinuityState.continuityKind !== 'dive') return null;
        if (perspectiveContinuityState.toPerspectiveId !== perspectiveId) return null;
        if (perspectiveContinuityState.targetEntryId !== projectPerspectiveContext.entryId) return null;
        if (!perspectiveContinuityState.sourceLabel || !perspectiveContinuityState.sourceTargetId) return null;

        const sourcePerspectiveId = perspectiveContinuityState.fromPerspectiveId ?? perspectiveId;
        const sourceEntryId = perspectiveContinuityState.sourceEntryId ?? projectPerspectiveContext.entryId;
        const focus = Object.freeze({
            targetId: perspectiveContinuityState.sourceTargetId,
            query: universeFocusState.query,
        });
        const search = withProjectDurableWorldSearchParams({
            searchParams: new URLSearchParams(),
            focus,
            entryId: sourceEntryId,
        });
        const href = buildHref(`/workspace/${sourcePerspectiveId}`, search);
        const envelope = buildProjectWorldNavigationEnvelope({
            camera: cameraRouteState,
            focus,
            continuity: {
                continuityKind: 'surface',
                fromPerspectiveId: perspectiveId,
                toPerspectiveId: sourcePerspectiveId,
                sourceTargetId: perspectiveContinuityState.sourceTargetId,
                sourceLabel: perspectiveContinuityState.sourceLabel,
                targetEntryId: sourceEntryId,
                sourceEntryId: projectPerspectiveContext.entryId,
                sourceKind: perspectiveContinuityState.sourceKind,
            },
        });

        return Object.freeze({
            sourcePerspectiveId,
            sourceEntryId,
            sourceLabel: perspectiveContinuityState.sourceLabel,
            sourceKind: perspectiveContinuityState.sourceKind,
            href,
            envelope,
        });
    }, [
        cameraRouteState,
        perspectiveContinuityState,
        perspectiveId,
        projectPerspectiveContext.entryId,
        universeFocusState.query,
    ]);

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

    const handleUniverseOpenTarget = useCallback((targetId) => {
        const handoff = resolveProjectUniverseEditorHandoff({
            universe: projectUniverse,
            targetId,
            currentPerspectiveId: perspectiveId,
            currentEntryId: projectPerspectiveContext.entryId,
        });
        if (!handoff) {
            handleUniverseFocusTarget(targetId);
            return;
        }

        const focus = Object.freeze({
            targetId: handoff.targetId,
            query: universeFocusState.query,
        });
        const search = withProjectDurableWorldSearchParams({
            searchParams: new URLSearchParams(),
            focus,
            entryId: handoff.entryId,
        });
        const href = buildHref(`/workspace/${handoff.perspectiveId}`, search);
        const envelope = buildProjectWorldNavigationEnvelope({
            camera: cameraRouteState,
            focus,
            continuity: {
                continuityKind: 'dive',
                fromPerspectiveId: perspectiveId,
                toPerspectiveId: handoff.perspectiveId,
                sourceTargetId: handoff.targetId,
                sourceLabel: handoff.label,
                sourceIntentLabel: `Open ${handoff.label} from Project Universe`,
                sourceIntentSource: 'universe',
                targetEntryId: handoff.entryId,
                sourceEntryId: projectPerspectiveContext.entryId,
                sourceKind: handoff.kind,
            },
        });
        writeNavigationEnvelopeForHref({ href, envelope });
        router.push(href, { scroll: false });
    }, [
        cameraRouteState,
        perspectiveId,
        projectPerspectiveContext.entryId,
        projectUniverse,
        router,
        universeFocusState.query,
        writeNavigationEnvelopeForHref,
    ]);
    const navigateArtifactWorkflowHref = useCallback((href, options = {}) => {
        const normalizedHref = typeof href === 'string' ? href.trim() : '';
        if (!normalizedHref) return;

        const url = new URL(
            normalizedHref,
            typeof window !== 'undefined' ? window.location.origin : 'https://dropple.local',
        );
        const explicitContinuityTargetId =
            typeof options?.continuityTarget?.targetId === 'string' && options.continuityTarget.targetId.trim().length > 0
                ? options.continuityTarget.targetId.trim()
                : null;
        const continuityTarget =
            explicitContinuityTargetId
                ? Object.freeze({
                      targetId: explicitContinuityTargetId,
                      label:
                          typeof options?.continuityTarget?.label === 'string' && options.continuityTarget.label.trim().length > 0
                              ? options.continuityTarget.label.trim()
                              : explicitContinuityTargetId,
                      kind:
                          typeof options?.continuityTarget?.kind === 'string' && options.continuityTarget.kind.trim().length > 0
                              ? options.continuityTarget.kind.trim()
                              : null,
                  })
                : resolveProjectUniverseContinuityTarget({
                      universe: projectUniverse,
                      targetId: url.searchParams.get('u') ?? universeFocusState.targetId ?? projectUniverse?.hubId,
                      currentPerspectiveId: perspectiveId,
                      currentEntryId: projectPerspectiveContext.entryId,
                  });
        const nextTarget = buildProjectArtifactContinuityHref({
            href: normalizedHref,
            camera: cameraRouteState,
            query: universeFocusState.query,
            currentPerspectiveId: perspectiveId,
            currentEntryId: projectPerspectiveContext.entryId,
            continuityTarget,
            continuityIntentLabel:
                typeof options?.intentLabel === 'string' && options.intentLabel.trim().length > 0
                    ? options.intentLabel.trim()
                    : null,
            continuityIntentSource:
                typeof options?.intentSource === 'string' && options.intentSource.trim().length > 0
                    ? options.intentSource.trim()
                    : null,
        });
        writeNavigationEnvelopeForHref(nextTarget);

        if (typeof window !== 'undefined') {
            window.location.assign(nextTarget.href);
            return;
        }
        router.push(nextTarget.href);
    }, [
        cameraRouteState,
        perspectiveId,
        projectPerspectiveContext.entryId,
        projectUniverse,
        router,
        universeFocusState.query,
        universeFocusState.targetId,
        writeNavigationEnvelopeForHref,
    ]);

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
    const operateWorkflow = useMemo(
        () =>
            perspectiveId === 'operate'
                ? buildOperatePerspectiveWorkflow({
                      entryId: projectPerspectiveContext.entryId,
                      document: projectedDocument,
                      universe: projectUniverse,
                  })
                : null,
        [perspectiveId, projectPerspectiveContext.entryId, projectedDocument, projectUniverse],
    );
    const operateWorldSummary = operateWorkflow?.worldSummary ?? null;
    const publishWorkflow = useMemo(
        () =>
            perspectiveId === 'publish'
                ? buildPublishPerspectiveWorkflow({
                      entryId: projectPerspectiveContext.entryId,
                      document: projectedDocument,
                      universe: projectUniverse,
                  })
                : null,
        [perspectiveId, projectPerspectiveContext.entryId, projectedDocument, projectUniverse],
    );
    const publishWorldSummary = useMemo(
        () =>
            perspectiveId === 'publish'
                ? publishWorkflow?.worldSummary ??
                  buildPublishPerspectiveWorldSummary({
                      entryId: projectPerspectiveContext.entryId,
                      document: projectedDocument,
                      universe: projectUniverse,
                  })
                : null,
        [perspectiveId, projectPerspectiveContext.entryId, projectedDocument, projectUniverse, publishWorkflow],
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
    const focusedUniverseItem = useMemo(
        () =>
            universeFocusState.targetId
                ? universeNavigatorItems.find((item) => item.targetId === universeFocusState.targetId) ?? null
                : null,
        [universeFocusState.targetId, universeNavigatorItems],
    );
    const focusedUniverseEntity = useMemo(() => {
        const targetId = universeFocusState.targetId ?? projectUniverse?.hubId ?? null;
        if (!targetId) return null;
        return projectUniverse?.groups?.[targetId] ?? projectUniverse?.nodes?.[targetId] ?? null;
    }, [projectUniverse?.groups, projectUniverse?.hubId, projectUniverse?.nodes, universeFocusState.targetId]);
    const universeOrientation = useMemo(
        () =>
            buildProjectUniverseOrientation({
                universe: projectUniverse,
                targetId: universeFocusState.targetId ?? projectUniverse?.hubId,
                query: navigatorQuery,
            }),
        [navigatorQuery, projectUniverse, universeFocusState.targetId],
    );
    const operateUniverseOrientation = useMemo(
        () =>
            perspectiveId === 'operate'
                ? buildProjectUniverseOrientation({
                      universe: projectUniverse,
                      targetId: universeFocusState.targetId ?? (projectUniverse?.groups?.['group:operate'] ? 'group:operate' : projectUniverse?.hubId),
                      query: navigatorQuery,
                  })
                : null,
        [navigatorQuery, perspectiveId, projectUniverse, universeFocusState.targetId],
    );
    const publishUniverseOrientation = useMemo(
        () =>
            perspectiveId === 'publish'
                ? buildProjectUniverseOrientation({
                      universe: projectUniverse,
                      targetId: universeFocusState.targetId ?? (projectUniverse?.groups?.['group:publish'] ? 'group:publish' : projectUniverse?.hubId),
                      query: navigatorQuery,
                  })
                : null,
        [navigatorQuery, perspectiveId, projectUniverse, universeFocusState.targetId],
    );
    const universeWorkflowGuide = useMemo(
        () =>
            buildProjectUniverseWorkflowGuide({
                perspectiveId,
                entryId: projectPerspectiveContext.entryId,
                orientation: universeOrientation,
                createWorkflow,
                buildWorkflow,
                collaborateWorkflow,
                operateWorldSummary,
                publishWorldSummary,
            }),
        [
            buildWorkflow,
            collaborateWorkflow,
            createWorkflow,
            operateWorldSummary,
            perspectiveId,
            projectPerspectiveContext.entryId,
            publishWorldSummary,
            universeOrientation,
        ],
    );
    const universeAtGlance = useMemo(
        () =>
            buildProjectUniverseAtGlance({
                universe: projectUniverse,
                orientation: universeOrientation,
                workflowGuide: universeWorkflowGuide,
            }),
        [projectUniverse, universeOrientation, universeWorkflowGuide],
    );
    const focusedUniverseCausality = useMemo(
        () => ({
            reliesOn:
                focusedUniverseEntity?.metadata?.reliesOnSummary ??
                (focusedUniverseItem?.targetType === 'hub' ? 'Relies on project-wide work' : null),
            influences:
                focusedUniverseEntity?.metadata?.influencesSummary ??
                (focusedUniverseItem?.targetType === 'hub' ? 'Influences every active perspective' : null),
            mattersNext:
                focusedUniverseEntity?.metadata?.mattersNextSummary ??
                (focusedUniverseItem?.targetType === 'hub' ? 'Matters next as the project world anchor' : null),
        }),
        [focusedUniverseEntity, focusedUniverseItem?.targetType],
    );
    const focusedUniverseGeography = useMemo(
        () => ({
            zoneLabel:
                focusedUniverseEntity?.metadata?.geographyLabel ??
                (focusedUniverseItem?.targetType === 'hub' ? 'Center' : null),
            summary:
                focusedUniverseEntity?.metadata?.geographySummary ??
                (focusedUniverseItem?.targetType === 'hub' ? 'Center project region' : null),
            north: focusedUniverseEntity?.metadata?.geographyRegions?.north ?? [],
            south: focusedUniverseEntity?.metadata?.geographyRegions?.south ?? [],
            east: focusedUniverseEntity?.metadata?.geographyRegions?.east ?? [],
            west: focusedUniverseEntity?.metadata?.geographyRegions?.west ?? [],
            center: focusedUniverseEntity?.metadata?.geographyRegions?.center ?? [],
        }),
        [focusedUniverseEntity, focusedUniverseItem?.targetType],
    );
    const assistantSurfaceState = assistantIntentStatus
        ? 'engaged'
        : assistantSurface?.activeAssistantId
          ? 'ready'
          : 'idle';
    const projectWorldAnchor = useMemo(
        () =>
            resolveProjectWorldAnchor({
                projectName: projectIdentity.name,
                perspectiveLabel,
                entryLabel: formatEntryLabel(projectPerspectiveContext.entryId),
                focusedUniverseItem,
                artifactCount: Object.keys(projectUniverse?.nodes ?? {}).filter((id) => id !== projectUniverse?.hubId).length,
            }),
        [
            focusedUniverseItem,
            perspectiveLabel,
            projectIdentity.name,
            projectPerspectiveContext.entryId,
            projectUniverse?.hubId,
            projectUniverse?.nodes,
        ],
    );
    const createShellChoreography = useMemo(
        () =>
            resolveCreateShellChoreography({
                utilityPanel: createUtilityPanel,
                hasSelection: isCreatePerspective && selectedIds.length > 0,
                hasMotionContext: false,
                assistantState: assistantSurfaceState,
                hasEditorEmergence: Boolean(editorEmergenceState),
            }),
        [assistantSurfaceState, createUtilityPanel, editorEmergenceState, isCreatePerspective, selectedIds.length],
    );
    const buildShellChoreography = useMemo(
        () =>
            resolveBuildShellChoreography({
                activeEntryId: projectPerspectiveContext.entryId,
                hasWorkflow: buildWorkflow.linkedArtifacts.length > 0,
                hasOperateHandoff: Boolean(buildWorkflow.operateHandoff),
                assistantState: assistantSurfaceState,
            }),
        [assistantSurfaceState, buildWorkflow.linkedArtifacts.length, buildWorkflow.operateHandoff, projectPerspectiveContext.entryId],
    );
    const collaborateShellChoreography = useMemo(
        () =>
            resolveCollaborateShellChoreography({
                activeEntryId: projectPerspectiveContext.entryId,
                hasWorkflow: collaborateWorkflow.linkedArtifacts.length > 0,
                hasPublishHandoff: Boolean(collaborateWorkflow.publishHandoff),
                assistantState: assistantSurfaceState,
            }),
        [
            assistantSurfaceState,
            collaborateWorkflow.linkedArtifacts.length,
            collaborateWorkflow.publishHandoff,
            projectPerspectiveContext.entryId,
        ],
    );
    const operateUniverseAnchor = useMemo(
        () =>
            perspectiveId === 'operate'
                ? buildProjectUniverseAnchoringSummary({
                      orientation: operateUniverseOrientation,
                  })
                : null,
        [operateUniverseOrientation, perspectiveId],
    );
    const operateShellChoreography = useMemo(
        () =>
            resolveOperateShellChoreography({
                activeEntryId: projectPerspectiveContext.entryId,
                hasWorkflow: Boolean(operateWorkflow?.linkedArtifacts?.length),
                hasUniverseAnchor: Boolean(operateUniverseAnchor),
                assistantState: assistantSurfaceState,
            }),
        [assistantSurfaceState, operateUniverseAnchor, operateWorkflow?.linkedArtifacts?.length, projectPerspectiveContext.entryId],
    );
    const publishUniverseAnchor = useMemo(
        () => {
            if (perspectiveId !== 'publish') return null;
            const summary = buildProjectUniverseAnchoringSummary({
                orientation: publishUniverseOrientation,
                workflowGuide: universeWorkflowGuide,
            });
            return Object.freeze({
                focusLabel: 'Publish',
                returnLabel: summary?.returnLabel ?? 'Project Hub',
                relatedCount: summary?.relatedCount ?? 0,
                upstreamCount: summary?.upstreamCount ?? 0,
                downstreamCount: summary?.downstreamCount ?? 0,
                nextLabel: summary?.nextLabel ?? 'Project Hub',
            });
        },
        [perspectiveId, publishUniverseOrientation, universeWorkflowGuide],
    );
    const publishShellChoreography = useMemo(
        () =>
            resolvePublishShellChoreography({
                activeEntryId: projectPerspectiveContext.entryId,
                hasWorkflow: Boolean(publishWorkflow?.linkedArtifacts?.length),
                hasUniverseAnchor: Boolean(publishUniverseAnchor),
                assistantState: assistantSurfaceState,
            }),
        [assistantSurfaceState, projectPerspectiveContext.entryId, publishUniverseAnchor, publishWorkflow?.linkedArtifacts?.length],
    );
    const assistantSurfaceContextSummary =
        perspectiveId === 'build'
            ? buildShellChoreography.assistantSummary
            : perspectiveId === 'collaborate'
              ? collaborateShellChoreography.assistantSummary
            : perspectiveId === 'operate'
              ? operateShellChoreography.assistantSummary
              : perspectiveId === 'publish'
                ? publishShellChoreography.assistantSummary
                : createShellChoreography.assistantSummary;
    const assistantSurfaceChoreographyState =
        perspectiveId === 'build'
            ? buildShellChoreography.assistantState
            : perspectiveId === 'collaborate'
              ? collaborateShellChoreography.assistantState
            : perspectiveId === 'operate'
              ? operateShellChoreography.assistantState
              : perspectiveId === 'publish'
                ? publishShellChoreography.assistantState
                : createShellChoreography.assistantState;

    const renderUniverseOrientation = () => {
        if (!universeOrientation) return null;
        const priorityTargets = universeOrientation.priorityTargets.slice(0, 3);
        const relatedTargets = universeOrientation.relatedTargets.slice(0, 3);
        const dependencyTargets = universeOrientation.dependencyTargets.slice(0, 3);
        const downstreamTargets = universeOrientation.downstreamTargets.slice(0, 3);
        const nextTargets = universeOrientation.nextTargets
            .filter((item) => item.targetId !== universeOrientation.returnTarget?.targetId)
            .slice(0, 3);

        return (
            <div
                data-testid='project-universe-orientation-summary'
                style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: 8,
                    background: '#ffffff',
                    padding: '8px 10px',
                    display: 'grid',
                    gap: 6,
                    marginBottom: 8,
                }}>
                <div
                    style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: '#64748b',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                    }}>
                    Orientation
                </div>
                {universeOrientation.returnTarget ? (
                    <div style={{ display: 'grid', gap: 4 }}>
                        <div style={{ fontSize: 10, color: '#64748b' }}>Return</div>
                        <button
                            type='button'
                            data-testid={`project-universe-orientation-return-${universeOrientation.returnTarget.targetId}`}
                            onClick={() => handleUniverseFocusTarget(universeOrientation.returnTarget.targetId)}
                            style={{
                                textAlign: 'left',
                                border: '1px solid #e2e8f0',
                                borderRadius: 6,
                                background: '#f8fafc',
                                color: '#0f172a',
                                padding: '6px 8px',
                                cursor: 'pointer',
                            }}>
                            <div style={{ fontSize: 11, fontWeight: 600 }}>{universeOrientation.returnTarget.label}</div>
                            <div style={{ fontSize: 10, color: '#64748b' }}>{universeOrientation.returnTarget.subtitle}</div>
                        </button>
                    </div>
                ) : null}
                {priorityTargets.length > 0 ? (
                    <div data-testid='project-universe-orientation-priority-summary' style={{ display: 'grid', gap: 4 }}>
                        <div style={{ fontSize: 10, color: '#64748b' }}>Priority path</div>
                        {priorityTargets.map((item) => (
                            <button
                                key={`priority-${item.targetId}`}
                                type='button'
                                data-testid={`project-universe-orientation-priority-${item.targetId}`}
                                onClick={() => handleUniverseFocusTarget(item.targetId)}
                                style={{
                                    textAlign: 'left',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: 6,
                                    background: '#f8fafc',
                                    color: '#0f172a',
                                    padding: '6px 8px',
                                    cursor: 'pointer',
                                }}>
                                <div style={{ fontSize: 11, fontWeight: 600 }}>{item.label}</div>
                                <div style={{ fontSize: 10, color: '#64748b' }}>
                                    {item.prioritySummary ?? item.relationshipSummary ?? item.subtitle}
                                </div>
                            </button>
                        ))}
                    </div>
                ) : null}
                {relatedTargets.length > 0 ? (
                    <div style={{ display: 'grid', gap: 4 }}>
                        <div style={{ fontSize: 10, color: '#64748b' }}>Related</div>
                        {relatedTargets.map((item) => (
                            <button
                                key={`related-${item.targetId}`}
                                type='button'
                                data-testid={`project-universe-orientation-related-${item.targetId}`}
                                onClick={() => handleUniverseFocusTarget(item.targetId)}
                                style={{
                                    textAlign: 'left',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: 6,
                                    background: '#ffffff',
                                    color: '#334155',
                                    padding: '6px 8px',
                                    cursor: 'pointer',
                                }}>
                                <div style={{ fontSize: 11, fontWeight: 600 }}>{item.label}</div>
                                <div style={{ fontSize: 10, color: '#64748b' }}>{item.relationshipSummary ?? item.subtitle}</div>
                            </button>
                        ))}
                    </div>
                ) : null}
                {dependencyTargets.length > 0 ? (
                    <div style={{ display: 'grid', gap: 4 }}>
                        <div style={{ fontSize: 10, color: '#64748b' }}>Upstream</div>
                        {dependencyTargets.map((item) => (
                            <button
                                key={`dependency-${item.targetId}`}
                                type='button'
                                data-testid={`project-universe-orientation-dependency-${item.targetId}`}
                                onClick={() => handleUniverseFocusTarget(item.targetId)}
                                style={{
                                    textAlign: 'left',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: 6,
                                    background: '#ffffff',
                                    color: '#334155',
                                    padding: '6px 8px',
                                    cursor: 'pointer',
                                }}>
                                <div style={{ fontSize: 11, fontWeight: 600 }}>{item.label}</div>
                                <div style={{ fontSize: 10, color: '#64748b' }}>{item.relationshipSummary ?? item.subtitle}</div>
                            </button>
                        ))}
                    </div>
                ) : null}
                {downstreamTargets.length > 0 ? (
                    <div style={{ display: 'grid', gap: 4 }}>
                        <div style={{ fontSize: 10, color: '#64748b' }}>Downstream</div>
                        {downstreamTargets.map((item) => (
                            <button
                                key={`downstream-${item.targetId}`}
                                type='button'
                                data-testid={`project-universe-orientation-downstream-${item.targetId}`}
                                onClick={() => handleUniverseFocusTarget(item.targetId)}
                                style={{
                                    textAlign: 'left',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: 6,
                                    background: '#ffffff',
                                    color: '#334155',
                                    padding: '6px 8px',
                                    cursor: 'pointer',
                                }}>
                                <div style={{ fontSize: 11, fontWeight: 600 }}>{item.label}</div>
                                <div style={{ fontSize: 10, color: '#64748b' }}>{item.relationshipSummary ?? item.subtitle}</div>
                            </button>
                        ))}
                    </div>
                ) : null}
                {nextTargets.length > 0 ? (
                    <div style={{ display: 'grid', gap: 4 }}>
                        <div style={{ fontSize: 10, color: '#64748b' }}>Next likely</div>
                        {nextTargets.map((item) => (
                            <button
                                key={`next-${item.targetId}`}
                                type='button'
                                data-testid={`project-universe-orientation-next-${item.targetId}`}
                                onClick={() => handleUniverseFocusTarget(item.targetId)}
                                style={{
                                    textAlign: 'left',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: 6,
                                    background: '#ffffff',
                                    color: '#334155',
                                    padding: '6px 8px',
                                    cursor: 'pointer',
                                }}>
                                <div style={{ fontSize: 11, fontWeight: 600 }}>{item.label}</div>
                                <div style={{ fontSize: 10, color: '#64748b' }}>{item.subtitle}</div>
                            </button>
                        ))}
                    </div>
                ) : null}
            </div>
        );
    };

    const renderUniverseWorkflowGuide = () => {
        if (!universeWorkflowGuide) return null;

        return (
            <div
                data-testid='project-universe-workflow-guide'
                style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: 8,
                    background: '#ffffff',
                    padding: '8px 10px',
                    display: 'grid',
                    gap: 6,
                    marginBottom: 8,
                }}>
                <div
                    style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: '#64748b',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                    }}>
                    What to do next
                </div>
                <div style={{ display: 'grid', gap: 2 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>
                        {universeWorkflowGuide.activityLabel}
                    </div>
                    <div style={{ fontSize: 10, color: '#334155' }}>
                        Now: <strong style={{ color: '#0f172a' }}>{universeWorkflowGuide.currentTaskLabel}</strong>
                    </div>
                    <div data-testid='project-universe-workflow-primary-next' style={{ fontSize: 10, color: '#334155' }}>
                        Do next: <strong style={{ color: '#0f172a' }}>{universeWorkflowGuide.primarySuggestionLabel}</strong>
                    </div>
                    <div style={{ fontSize: 10, color: '#64748b' }}>{universeWorkflowGuide.summaryLabel}</div>
                    {focusedUniverseCausality.mattersNext ? (
                        <div data-testid='project-universe-workflow-causality' style={{ fontSize: 10, color: '#475569' }}>
                            {focusedUniverseCausality.mattersNext}
                        </div>
                    ) : null}
                    <div data-testid='project-universe-workflow-primary-source' style={{ fontSize: 10, color: '#64748b' }}>
                        {universeWorkflowGuide.primarySuggestionSourceLabel}
                    </div>
                    <div data-testid='project-universe-workflow-primary-reason' style={{ fontSize: 10, color: '#475569' }}>
                        Why now: {universeWorkflowGuide.primarySuggestionReadableReason}
                    </div>
                </div>
                {universeWorkflowGuide.suggestions.length > 0 ? (
                    <div style={{ display: 'grid', gap: 4 }}>
                        <div style={{ fontSize: 10, color: '#64748b' }}>Next moves</div>
                        {universeWorkflowGuide.suggestions.map((suggestion) => (
                            <button
                                key={suggestion.id}
                                type='button'
                                data-testid={`project-universe-workflow-suggestion-${suggestion.id}`}
                                onClick={() =>
                                    navigateArtifactWorkflowHref(suggestion.href, {
                                        intentLabel: suggestion.reason,
                                        intentSource: suggestion.source,
                                    })
                                }
                                style={{
                                    textAlign: 'left',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: 6,
                                    background: '#ffffff',
                                    color: '#334155',
                                    padding: '6px 8px',
                                    cursor: 'pointer',
                                }}>
                                <div style={{ fontSize: 11, fontWeight: 600, color: '#0f172a' }}>{suggestion.label}</div>
                                <div style={{ fontSize: 10, color: '#64748b' }}>{suggestion.readableReason}</div>
                                <div style={{ fontSize: 10, color: '#94a3b8' }}>{suggestion.sourceLabel}</div>
                            </button>
                        ))}
                    </div>
                ) : null}
            </div>
        );
    };

    const renderUniverseAtGlance = () => {
        if (!universeAtGlance) return null;

        return (
            <div
                data-testid='project-universe-at-a-glance'
                style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: 8,
                    background: '#ffffff',
                    padding: '8px 10px',
                    display: 'grid',
                    gap: 6,
                    marginBottom: 8,
                }}>
                <div
                    style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: '#64748b',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                    }}>
                    Project At A Glance
                </div>
                <div data-testid='project-universe-at-a-glance-exists' style={{ fontSize: 10, color: '#334155' }}>
                    Exists: <strong style={{ color: '#0f172a' }}>{universeAtGlance.existsLabel}</strong>
                </div>
                <div data-testid='project-universe-at-a-glance-active' style={{ fontSize: 10, color: '#334155' }}>
                    Active: <strong style={{ color: '#0f172a' }}>{universeAtGlance.activeLabel}</strong>
                </div>
                <div data-testid='project-universe-at-a-glance-next' style={{ fontSize: 10, color: '#334155' }}>
                    Next: <strong style={{ color: '#0f172a' }}>{universeAtGlance.nextLabel}</strong>
                </div>
                <div data-testid='project-universe-at-a-glance-blocked' style={{ fontSize: 10, color: '#334155' }}>
                    Blocked: <strong style={{ color: '#0f172a' }}>{universeAtGlance.blockedLabel}</strong>
                </div>
                <div data-testid='project-universe-at-a-glance-done' style={{ fontSize: 10, color: '#334155' }}>
                    Done: <strong style={{ color: '#0f172a' }}>{universeAtGlance.doneLabel}</strong>
                </div>
            </div>
        );
    };

    const renderUniverseDominanceValidation = ({
        panelTestId = 'project-universe-dominance-panel',
        summaryTestId = 'project-universe-dominance-summary',
    } = {}) => {
        const hasGeography = Boolean(focusedUniverseGeography.summary);
        const hasPriority = Boolean(
            universeOrientation?.priorityTargets?.length ||
                universeNavigatorItems.some(
                    (item) => item.prioritySummary || item.primaryRelationshipType || item.primaryRelationshipLabel,
                ),
        );
        const priorityState = hasPriority ? 'ranked' : !focusedUniverseItem || focusedUniverseItem.targetType === 'hub' ? 'project-scoped' : 'none';
        const hasWorkflow = Boolean(universeWorkflowGuide?.suggestions?.length);
        const hasExplicitIntent = Boolean(projectIntentDescriptor);
        const focusLabel = focusedUniverseItem?.label ?? 'Project Hub';
        const summaryLabel = hasWorkflow
            ? `${focusLabel} is leading project comprehension through geography, ranked relationships, and next work.`
            : `${focusLabel} is leading project comprehension through geography and ranked relationships.`;

        return (
            <div
                data-testid={panelTestId}
                data-dominance='primary'
                data-anchor='persistent'
                data-geography={hasGeography ? 'mapped' : 'missing'}
                data-priority={priorityState}
                data-workflow={hasWorkflow ? 'guided' : 'contextual'}
                data-intent={hasExplicitIntent ? 'explicit' : 'ambient'}
                style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: 8,
                    background: '#ffffff',
                    padding: '8px 10px',
                    display: 'grid',
                    gap: 6,
                    marginBottom: 8,
                }}>
                <div
                    style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: '#64748b',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                    }}>
                    Universe Dominance
                </div>
                <div data-testid={summaryTestId} style={{ fontSize: 10, color: '#475569' }}>
                    {summaryLabel}
                </div>
                <div style={{ display: 'grid', gap: 3 }}>
                    <div style={{ fontSize: 10, color: '#64748b' }}>
                        Anchor: <strong style={{ color: '#334155' }}>persistent world anchor</strong>
                    </div>
                    <div style={{ fontSize: 10, color: '#64748b' }}>
                        Focus: <strong style={{ color: '#334155' }}>{focusLabel}</strong>
                    </div>
                    <div style={{ fontSize: 10, color: '#64748b' }}>
                        Guidance: <strong style={{ color: '#334155' }}>{hasWorkflow ? 'universe-first next work' : 'world context is still leading'}</strong>
                    </div>
                    <div style={{ fontSize: 10, color: '#64748b' }}>
                        Intent: <strong style={{ color: '#334155' }}>{hasExplicitIntent ? 'cross-perspective intent is explicit' : 'ambient project intent'}</strong>
                    </div>
                </div>
            </div>
        );
    };

    const renderUniverseGeography = () => {
        const geographySummary = focusedUniverseGeography.summary;
        if (!geographySummary) return null;

        const geographyRows =
            focusedUniverseItem?.targetType === 'hub'
                ? [
                      ['North', focusedUniverseGeography.north],
                      ['South', focusedUniverseGeography.south],
                      ['East', focusedUniverseGeography.east],
                      ['West', focusedUniverseGeography.west],
                      ['Center', focusedUniverseGeography.center],
                  ].filter(([, labels]) => Array.isArray(labels) && labels.length > 0)
                : [];

        return (
            <div
                data-testid='project-universe-geography-summary'
                style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: 8,
                    background: '#ffffff',
                    padding: '8px 10px',
                    display: 'grid',
                    gap: 6,
                    marginBottom: 8,
                }}>
                <div
                    style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: '#64748b',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                    }}>
                    Project Geography
                </div>
                {focusedUniverseGeography.zoneLabel ? (
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>
                        {focusedUniverseGeography.zoneLabel}
                    </div>
                ) : null}
                <div style={{ fontSize: 10, color: '#475569' }}>{geographySummary}</div>
                {geographyRows.length > 0 ? (
                    <div style={{ display: 'grid', gap: 3 }}>
                        {geographyRows.map(([label, values]) => (
                            <div key={label} style={{ fontSize: 10, color: '#64748b' }}>
                                {label}: <strong style={{ color: '#334155' }}>{values.join(', ')}</strong>
                            </div>
                        ))}
                    </div>
                ) : null}
            </div>
        );
    };

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
        <div
            data-testid='project-shell-root'
            data-motion-mode={motionMode}
            data-motion-meaning='world-continuity'
            style={{
                display: 'grid',
                gridTemplateRows: 'auto auto 1fr',
                minHeight: '100dvh',
                height: '100dvh',
                background: '#f8fafc',
            }}>
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
                    display: 'grid',
                    gap: 10,
                    padding: isCreatePerspective ? 0 : '10px 14px',
                    borderBottom: isCreatePerspective ? 'none' : '1px solid #e2e8f0',
                    background: isCreatePerspective ? 'transparent' : '#ffffff',
                    position: isCreatePerspective ? 'absolute' : 'relative',
                    top: isCreatePerspective ? 16 : undefined,
                    left: isCreatePerspective ? 16 : undefined,
                    zIndex: isCreatePerspective ? 40 : undefined,
                }}>
                {isCreatePerspective ? (
                    <div
                        data-testid='worldshell-project-capsule'
                        style={{
                            display: 'grid',
                            gap: 4,
                            minWidth: 220,
                            padding: '12px 14px',
                            borderRadius: 18,
                            border: '1px solid rgba(148, 163, 184, 0.22)',
                            background: 'rgba(255, 255, 255, 0.92)',
                            boxShadow: '0 20px 40px rgba(15, 23, 42, 0.12)',
                            backdropFilter: 'blur(14px)',
                        }}>
                        <span
                            style={{
                                fontSize: 11,
                                fontWeight: 700,
                                letterSpacing: '0.04em',
                                color: '#0f172a',
                            }}>
                            Dropple
                        </span>
                        <strong
                            data-testid='worldshell-project-capsule-project'
                            style={{ fontSize: 16, lineHeight: 1.2, color: '#0f172a' }}>
                            {projectIdentity.name}
                        </strong>
                        <span
                            data-testid='worldshell-project-capsule-context'
                            style={{ fontSize: 12, color: '#475569', fontWeight: 600 }}>
                            {perspectiveLabel} {'>'} {formatEntryLabel(projectPerspectiveContext.entryId)}
                        </span>
                    </div>
                ) : (
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            justifyContent: 'space-between',
                            gap: 12,
                            flexWrap: 'wrap',
                        }}>
                        <div style={{ display: 'grid', gap: 6 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
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
                                <strong style={{ fontSize: 16, color: '#0f172a' }}>{activeContextLabel}</strong>
                                {transitionDescriptor ? (
                                    <span
                                        data-testid='project-shell-transition-context'
                                        data-motion-meaning='continuity'
                                        data-motion-mode={motionMode}
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            padding: '4px 8px',
                                            borderRadius: 999,
                                            fontSize: 10,
                                            fontWeight: 700,
                                            letterSpacing: '0.06em',
                                            textTransform: 'uppercase',
                                            color: '#0f766e',
                                            background: '#ecfeff',
                                            border: '1px solid #99f6e4',
                                        }}>
                                        {transitionDescriptor}
                                    </span>
                                ) : null}
                                {projectIntentDescriptor ? (
                                    <span
                                        data-testid='project-shell-project-intent'
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            padding: '4px 8px',
                                            borderRadius: 999,
                                            fontSize: 10,
                                            fontWeight: 600,
                                            color: '#1d4ed8',
                                            background: '#eff6ff',
                                            border: '1px solid #bfdbfe',
                                        }}>
                                        {projectIntentDescriptor}
                                    </span>
                                ) : null}
                            </div>
                            <div
                                data-testid='project-world-anchor'
                                data-motion-meaning='hierarchy'
                                style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', fontSize: 11, color: '#475569' }}>
                                <span data-testid='project-world-anchor-project'>
                                    <strong style={{ color: '#0f172a' }}>{projectWorldAnchor.projectLabel}</strong>
                                </span>
                                <span>
                                    {perspectiveLabel} / <span data-testid='project-world-anchor-activity'>{projectWorldAnchor.activityLabel}</span>
                                </span>
                                <span data-testid='project-world-anchor-focus'>
                                    Focus: <strong style={{ color: '#0f172a' }}>{projectWorldAnchor.focusLabel}</strong>
                                </span>
                                <span data-testid='project-world-anchor-subtitle' style={{ color: '#64748b' }}>
                                    {projectWorldAnchor.focusSubtitle}
                                </span>
                            </div>
                            <nav
                                aria-label='Project perspectives'
                                style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                {perspectiveIds.map((id) => {
                                    const active = id === perspectiveId;
                                    const definition = getProjectPerspectiveDefinition(id);
                                    const navigationTarget = buildPerspectiveNavigationTarget(id);
                                    return (
                                        <Link
                                            key={id}
                                            href={navigationTarget.href}
                                            onClick={() => writeNavigationEnvelopeForHref(navigationTarget)}
                                            style={{
                                                padding: '6px 10px',
                                                borderRadius: 999,
                                                fontSize: 11,
                                                fontWeight: 600,
                                                textDecoration: 'none',
                                                border: `1px solid ${active ? '#0f172a' : '#fed7aa'}`,
                                                color: active ? '#ffffff' : '#7c2d12',
                                                background: active ? '#0f172a' : '#ffffff',
                                            }}>
                                            {definition?.label ?? formatEntryLabel(id)}
                                        </Link>
                                    );
                                })}
                            </nav>
                            <nav
                                aria-label={`${perspectiveLabel} entries`}
                                style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                {perspectiveEntries.map((entryId) => {
                                    const active = entryId === projectPerspectiveContext.entryId;
                                    return (
                                        <Link
                                            key={entryId}
                                            href={`/workspace/${perspectiveId}?entry=${entryId}`}
                                            style={{
                                                padding: '4px 8px',
                                                borderRadius: 999,
                                                fontSize: 10,
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
                        </div>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                            <button
                                type='button'
                                data-testid='project-world-anchor-hub'
                                onClick={() => handleUniverseFocusTarget(projectUniverse?.hubId ?? 'project:hub')}
                                style={{
                                    border: '1px solid #cbd5e1',
                                    borderRadius: 999,
                                    background: '#ffffff',
                                    color: '#0f172a',
                                    fontSize: 11,
                                    fontWeight: 600,
                                    padding: '6px 10px',
                                    cursor: 'pointer',
                                }}>
                                Project Hub
                            </button>
                            <details data-testid='project-shell-world-details'>
                                <summary
                                    style={{
                                        cursor: 'pointer',
                                        listStyle: 'none',
                                        fontSize: 11,
                                        color: '#64748b',
                                        border: '1px solid #cbd5e1',
                                        borderRadius: 999,
                                        background: '#ffffff',
                                        padding: '6px 10px',
                                    }}>
                                    World details
                                </summary>
                                <div style={{ marginTop: 8, minWidth: 260 }}>
                                    {renderUniverseDominanceValidation()}
                                </div>
                            </details>
                            <details data-testid='project-shell-runtime-details'>
                                <summary
                                    style={{
                                        cursor: 'pointer',
                                        listStyle: 'none',
                                        fontSize: 11,
                                        color: '#64748b',
                                        border: '1px solid #cbd5e1',
                                        borderRadius: 999,
                                        background: '#ffffff',
                                        padding: '6px 10px',
                                    }}>
                                    Shell details
                                </summary>
                                <div
                                    style={{
                                        marginTop: 8,
                                        padding: '8px 10px',
                                        borderRadius: 8,
                                        border: '1px solid #cbd5e1',
                                        background: '#ffffff',
                                        color: '#475569',
                                        fontSize: 11,
                                        display: 'grid',
                                        gap: 4,
                                    }}>
                                    <span data-testid='project-shell-runtime-label'>
                                        runtime: {projectPerspectiveContext.workspaceId}/{activeModeId ?? projectPerspectiveContext.modeId}
                                    </span>
                                    <span>mode: {activeModeId ?? projectPerspectiveContext.modeId}</span>
                                    <span>perspective: {projectPerspectiveContext.perspectiveId}</span>
                                </div>
                            </details>
                            <button
                                type='button'
                                onClick={shareCurrentView}
                                style={{
                                    border: '1px solid #cbd5e1',
                                    borderRadius: 999,
                                    background: '#ffffff',
                                    color: '#334155',
                                    fontSize: 11,
                                    padding: '6px 10px',
                                    cursor: 'pointer',
                                }}>
                                Share View
                            </button>
                            {shareFeedback ? (
                                <span style={{ fontSize: 11, color: '#0f766e', alignSelf: 'center' }}>{shareFeedback}</span>
                            ) : null}
                        </div>
                    </div>
                )}
            </header>
            {editorEmergenceState ? (
                <section
                    data-testid='project-shell-editor-emergence'
                    data-motion-meaning='continuity'
                    data-emergence-state='editor-dive'
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 12,
                        padding: '8px 16px',
                        borderBottom: '1px solid #e2e8f0',
                        background: '#f8fafc',
                    }}>
                    <div style={{ display: 'grid', gap: 2 }}>
                        <strong style={{ fontSize: 11, color: '#0f172a', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                            Opened Here
                        </strong>
                        <span style={{ fontSize: 12, color: '#334155' }}>
                            Opened from {editorEmergenceState.sourceLabel}
                            {editorEmergenceState.sourceKind ? ` · ${formatArtifactKindLabel(editorEmergenceState.sourceKind)}` : ''}
                        </span>
                        <span style={{ fontSize: 11, color: '#64748b' }}>
                            Back to {formatEntryLabel(editorEmergenceState.sourcePerspectiveId)} / {formatEntryLabel(editorEmergenceState.sourceEntryId)} when you leave this editor.
                        </span>
                    </div>
                    <Link
                        data-testid='project-shell-surface-return'
                        href={editorEmergenceState.href}
                        onClick={() => writeNavigationEnvelopeForHref(editorEmergenceState)}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            border: '1px solid #cbd5e1',
                            borderRadius: 999,
                            background: '#ffffff',
                            color: '#0f172a',
                            fontSize: 11,
                            fontWeight: 600,
                            textDecoration: 'none',
                            padding: '6px 10px',
                        }}>
                        Back to {formatEntryLabel(editorEmergenceState.sourcePerspectiveId)} / {formatEntryLabel(editorEmergenceState.sourceEntryId)}
                    </Link>
                </section>
            ) : null}
            <div style={{ minHeight: 0, display: 'grid', gridTemplateRows: isCreatePerspective ? '1fr' : 'auto 1fr' }}>
                {isCreatePerspective ? null : (
                <ProjectUniverseCanvas
                    perspectiveId={perspectiveId}
                    universe={projectUniverse}
                    motionMode={motionMode}
                    initialCamera={cameraRouteState}
                    preserveExplicitCameraOnFocus={preserveExplicitCameraOnFocus}
                    onCameraChange={handleCameraChange}
                    focusedTargetId={universeFocusState.targetId}
                    onFocusTarget={handleUniverseFocusTarget}
                    onOpenTarget={handleUniverseOpenTarget}
                />
                )}
                <div
                    style={{
                        minHeight: 0,
                        display: 'grid',
                        gridTemplateColumns: isCreatePerspective ? 'minmax(0, 1fr)' : '280px minmax(0, 1fr)',
                        position: 'relative',
                    }}>
                    <aside
                        style={{
                            display: isCreatePerspective ? 'none' : 'block',
                            position: isCreatePerspective ? 'absolute' : 'relative',
                            top: isCreatePerspective ? 16 : undefined,
                            left: isCreatePerspective ? 16 : undefined,
                            bottom: isCreatePerspective ? 16 : undefined,
                            width: isCreatePerspective ? 232 : undefined,
                            zIndex: isCreatePerspective ? 16 : undefined,
                            borderRight: isCreatePerspective ? 'none' : '1px solid #e2e8f0',
                            border: isCreatePerspective ? '1px solid #e2e8f0' : undefined,
                            borderRadius: isCreatePerspective ? 14 : undefined,
                            boxShadow: isCreatePerspective ? '0 18px 36px rgba(15, 23, 42, 0.12)' : undefined,
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
                        {perspectiveId === 'build' ? (
                            <div style={{ padding: 10, borderBottom: '1px solid #e2e8f0' }}>
                                <div
                                    data-testid='build-room-panel'
                                    data-room-contract='build-world'
                                    data-room-choreography={buildShellChoreography.roomState}
                                    data-room-workflow={buildShellChoreography.workflowState}
                                    data-room-handoff={buildShellChoreography.handoffState}
                                    data-room-focus={buildShellChoreography.focusState}
                                    style={{ display: 'grid', gap: 8 }}>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                                        Build Workflow
                                    </div>
                                    <div
                                        data-testid='build-workflow-panel'
                                        data-choreography-state={buildShellChoreography.workflowState}
                                        data-context-visibility={buildShellChoreography.workflowState === 'yielding' ? 'supporting' : 'expanded'}
                                        style={{
                                            border: '1px solid #e2e8f0',
                                            borderRadius: 8,
                                            padding: 8,
                                            background: '#f8fafc',
                                            display: 'grid',
                                            gap: 8,
                                        }}>
                                        <div
                                            data-testid='build-world-panel'
                                            style={{
                                                border: '1px solid #dbeafe',
                                                borderRadius: 8,
                                                background: '#ffffff',
                                                padding: '8px 10px',
                                                display: 'grid',
                                                gap: 6,
                                            }}>
                                        <div
                                            style={{
                                                fontSize: 10,
                                                fontWeight: 700,
                                                letterSpacing: '0.04em',
                                                textTransform: 'uppercase',
                                                color: '#1d4ed8',
                                            }}>
                                            Build World
                                        </div>
                                        <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>
                                            {buildWorkflow.worldSummary.activityLabel}
                                        </div>
                                        <div
                                            data-testid='build-world-summary'
                                            style={{ display: 'grid', gap: 3, fontSize: 10, color: '#475569' }}>
                                            <span>
                                                Current task:{' '}
                                                <strong style={{ color: '#0f172a' }}>
                                                    {buildWorkflow.worldSummary.activeArtifactLabel ?? 'Awaiting build artifact'}
                                                </strong>
                                            </span>
                                            <span>
                                                Assistant:{' '}
                                                <strong style={{ color: '#0f172a' }}>
                                                    {buildAssistantLabels?.assistantLabel ?? 'Build Assistant'}
                                                </strong>
                                            </span>
                                            <span>
                                                Linked artifacts:{' '}
                                                <strong style={{ color: '#0f172a' }}>
                                                    {buildWorkflow.worldSummary.linkedArtifactCount}
                                                </strong>{' '}
                                                across{' '}
                                                <strong style={{ color: '#0f172a' }}>
                                                    {buildWorkflow.worldSummary.clusterCount}
                                                </strong>{' '}
                                                build clusters
                                            </span>
                                            <span>
                                                Operate bridge:{' '}
                                                <strong style={{ color: '#0f172a' }}>
                                                    {buildWorkflow.worldSummary.operateBridgeLabel ?? 'Not ready'}
                                                </strong>
                                            </span>
                                            <span>
                                                Build focus:{' '}
                                                <strong style={{ color: '#0f172a' }}>
                                                    {buildShellChoreography.focusState}
                                                </strong>
                                            </span>
                                            <span>
                                                Room behavior:{' '}
                                                <strong style={{ color: '#0f172a' }}>
                                                    {buildShellChoreography.roomState}
                                                </strong>
                                            </span>
                                        </div>
                                    </div>
                                    {buildWorkflow.suggestedNextArtifact ? (
                                        <button
                                            type='button'
                                            onClick={() => navigateArtifactWorkflowHref(buildWorkflow.suggestedNextArtifact.href)}
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
                                            onClick={() =>
                                                navigateArtifactWorkflowHref(buildWorkflow.operateHandoff.href, {
                                                    intentLabel: 'Move from build planning into live operating context.',
                                                    intentSource: 'workflow',
                                                })
                                            }
                                            data-testid='build-workflow-operate-handoff'
                                            data-choreography-state={buildShellChoreography.handoffState}
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
                                                            onClick={() => navigateArtifactWorkflowHref(item.href)}
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
                            </div>
                        ) : null}
                        {perspectiveId === 'operate' ? (
                            <div style={{ padding: 10, borderBottom: '1px solid #e2e8f0' }}>
                                <div
                                    data-testid='operate-room-panel'
                                    data-room-contract='operate-world'
                                    data-room-choreography={operateShellChoreography.roomState}
                                    data-room-workflow={operateShellChoreography.workflowState}
                                    data-room-guidance={operateShellChoreography.assistantState}
                                    data-room-anchor={operateShellChoreography.anchorState}
                                    data-room-focus={operateShellChoreography.focusState}
                                    style={{ display: 'grid', gap: 8 }}>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                                        Operate World
                                    </div>
                                    <div
                                        data-testid='operate-world-panel'
                                        style={{
                                            border: '1px solid #dcfce7',
                                            borderRadius: 8,
                                            padding: 8,
                                            background: '#f0fdf4',
                                            display: 'grid',
                                            gap: 8,
                                        }}>
                                        <div
                                            style={{
                                                fontSize: 10,
                                                fontWeight: 700,
                                                letterSpacing: '0.04em',
                                                textTransform: 'uppercase',
                                                color: '#166534',
                                            }}>
                                            Operate World
                                        </div>
                                        <div style={{ fontSize: 12, fontWeight: 700, color: '#14532d' }}>
                                            {operateWorldSummary?.activityLabel ?? 'Operate'}
                                        </div>
                                        <div
                                            data-testid='operate-world-summary'
                                            style={{ display: 'grid', gap: 3, fontSize: 10, color: '#166534' }}>
                                            <span>
                                                Current task:{' '}
                                                <strong style={{ color: '#14532d' }}>
                                                    {operateWorldSummary?.currentTaskLabel ?? 'Awaiting operate context'}
                                                </strong>
                                            </span>
                                            <span>
                                                Assistant:{' '}
                                                <strong style={{ color: '#14532d' }}>
                                                    {operateAssistantLabels?.assistantLabel ?? 'Operations Assistant'}
                                                </strong>
                                            </span>
                                            <span>
                                                Context:{' '}
                                                <strong style={{ color: '#14532d' }}>
                                                    {operateWorldSummary?.linkedContextCount ?? 0}
                                                </strong>{' '}
                                                linked operate targets
                                            </span>
                                            <span>
                                                Linked artifacts:{' '}
                                                <strong style={{ color: '#14532d' }}>
                                                    {operateWorldSummary?.linkedArtifactCount ?? 0}
                                                </strong>{' '}
                                                across{' '}
                                                <strong style={{ color: '#14532d' }}>
                                                    {operateWorldSummary?.clusterCount ?? 0}
                                                </strong>{' '}
                                                operate clusters
                                            </span>
                                            <span>
                                                Signals:{' '}
                                                <strong style={{ color: '#14532d' }}>
                                                    {operateWorldSummary?.summaryLabel ?? 'No operate signals'}
                                                </strong>
                                            </span>
                                            <span>
                                                Next focus:{' '}
                                                <strong style={{ color: '#14532d' }}>
                                                    {operateWorldSummary?.nextTargetLabel ?? 'No operate next target'}
                                                </strong>
                                            </span>
                                            <span>
                                                Guidance:{' '}
                                                <strong style={{ color: '#14532d' }}>
                                                    {operateWorldSummary?.assistantSummary ?? 'Operations Assistant is ready to guide this activity.'}
                                                </strong>
                                            </span>
                                            <span>
                                                Operate focus:{' '}
                                                <strong style={{ color: '#14532d' }}>
                                                    {operateShellChoreography.focusState}
                                                </strong>
                                            </span>
                                            <span>
                                                Room behavior:{' '}
                                                <strong style={{ color: '#14532d' }}>
                                                    {operateShellChoreography.roomState}
                                                </strong>
                                            </span>
                                        </div>
                                    </div>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                                        Operate Workflow
                                    </div>
                                    <div
                                        data-testid='operate-workflow-panel'
                                        data-choreography-state={operateShellChoreography.workflowState}
                                        data-context-visibility={operateShellChoreography.workflowState === 'yielding' ? 'supporting' : 'expanded'}
                                        style={{
                                            border: '1px solid #e2e8f0',
                                            borderRadius: 8,
                                            padding: 8,
                                            background: '#f8fafc',
                                            display: 'grid',
                                            gap: 8,
                                        }}>
                                        {operateWorkflow?.suggestedNextArtifact ? (
                                            <button
                                                type='button'
                                                onClick={() => navigateArtifactWorkflowHref(operateWorkflow.suggestedNextArtifact.href)}
                                                data-testid='operate-workflow-suggested-next'
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
                                                    Continue Operating
                                                </span>
                                                <strong style={{ fontSize: 12, color: '#166534' }}>
                                                    {operateWorkflow.suggestedNextArtifact.label}
                                                </strong>
                                                <span style={{ fontSize: 10 }}>
                                                    {operateWorkflow.suggestedNextArtifact.clusterLabel} · {operateWorkflow.suggestedNextArtifact.entryLabel}
                                                </span>
                                            </button>
                                        ) : null}
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                            {operateWorkflow?.entrySummaries?.map((summary) => (
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
                                            {operateWorkflow?.artifactClusters?.map((cluster) => (
                                                <div key={cluster.clusterId} data-testid={`operate-workflow-cluster-${cluster.clusterId}`}>
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
                                                                onClick={() => navigateArtifactWorkflowHref(item.href)}
                                                                data-testid={`operate-workflow-link-${item.targetId}-${item.entryId}`}
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
                                            {operateWorkflow?.linkedArtifacts?.length === 0 ? (
                                                <span style={{ fontSize: 11, color: '#64748b' }}>
                                                    No linked operate artifacts
                                                </span>
                                            ) : null}
                                        </div>
                                    </div>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                                        Operate Guidance
                                    </div>
                                    <div
                                        data-testid='operate-guidance-panel'
                                        data-choreography-state={operateShellChoreography.assistantState}
                                        style={{
                                            border: '1px solid #dbeafe',
                                            borderRadius: 8,
                                            padding: 8,
                                            background: '#f8fbff',
                                            display: 'grid',
                                            gap: 6,
                                        }}>
                                        <div style={{ fontSize: 12, fontWeight: 700, color: '#1d4ed8' }}>
                                            {operateWorkflow?.assistantGuidance?.assistantLabel ?? 'Operations Assistant'}
                                        </div>
                                        <div
                                            data-testid='operate-guidance-summary'
                                            style={{ display: 'grid', gap: 3, fontSize: 10, color: '#1e3a8a' }}>
                                            <span>
                                                Current guidance:{' '}
                                                <strong style={{ color: '#1d4ed8' }}>
                                                    {operateWorkflow?.assistantGuidance?.assistantSummary ?? 'Operations Assistant is ready to guide this activity.'}
                                                </strong>
                                            </span>
                                            <span>
                                                Next move:{' '}
                                                <strong style={{ color: '#1d4ed8' }}>
                                                    {operateWorkflow?.assistantGuidance?.nextGuidanceLabel ?? 'Keep the operating world anchored.'}
                                                </strong>
                                            </span>
                                            <span>
                                                System note:{' '}
                                                <strong style={{ color: '#1d4ed8' }}>
                                                    {operateWorkflow?.assistantGuidance?.systemGuidanceLabel ?? 'Keep operating context connected to the project world.'}
                                                </strong>
                                            </span>
                                        </div>
                                    </div>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                                        Operate Universe Anchor
                                    </div>
                                    <div
                                        data-testid='operate-universe-anchor-panel'
                                        data-choreography-state={operateShellChoreography.anchorState}
                                        style={{
                                            border: '1px solid #cbd5e1',
                                            borderRadius: 8,
                                            padding: 8,
                                            background: '#ffffff',
                                            display: 'grid',
                                            gap: 6,
                                        }}>
                                        <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>
                                            {operateUniverseAnchor?.focusLabel ?? projectWorldAnchor.focusLabel}
                                        </div>
                                        <div
                                            data-testid='operate-universe-anchor-summary'
                                            style={{ display: 'grid', gap: 3, fontSize: 10, color: '#475569' }}>
                                            <span>
                                                Return anchor:{' '}
                                                <strong style={{ color: '#0f172a' }}>
                                                    {operateUniverseAnchor?.returnLabel ?? 'Project Hub'}
                                                </strong>
                                            </span>
                                            <span>
                                                Related context:{' '}
                                                <strong style={{ color: '#0f172a' }}>
                                                    {operateUniverseAnchor?.relatedCount ?? 0}
                                                </strong>{' '}
                                                linked world targets
                                            </span>
                                            <span>
                                                World flow:{' '}
                                                <strong style={{ color: '#0f172a' }}>
                                                    {operateUniverseAnchor?.upstreamCount ?? 0}
                                                </strong>{' '}
                                                upstream ·{' '}
                                                <strong style={{ color: '#0f172a' }}>
                                                    {operateUniverseAnchor?.downstreamCount ?? 0}
                                                </strong>{' '}
                                                downstream
                                            </span>
                                            <span>
                                                Next likely world target:{' '}
                                                <strong style={{ color: '#0f172a' }}>
                                                    {operateUniverseAnchor?.nextLabel ?? 'Project Hub'}
                                                </strong>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : null}
                        {perspectiveId === 'collaborate' ? (
                            <div style={{ padding: 10, borderBottom: '1px solid #e2e8f0' }}>
                                <div
                                    data-testid='collaborate-room-panel'
                                    data-room-contract='collaborate-world'
                                    data-room-choreography={collaborateShellChoreography.roomState}
                                    data-room-workflow={collaborateShellChoreography.workflowState}
                                    data-room-handoff={collaborateShellChoreography.handoffState}
                                    data-room-focus={collaborateShellChoreography.focusState}
                                    style={{ display: 'grid', gap: 8 }}>
                                <div style={{ fontSize: 11, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                                    Collaborate World
                                </div>
                                <div
                                    data-testid='collaborate-world-panel'
                                    style={{
                                        border: '1px solid #ddd6fe',
                                        borderRadius: 8,
                                        padding: 8,
                                        background: '#faf5ff',
                                        display: 'grid',
                                        gap: 8,
                                        marginBottom: 8,
                                    }}>
                                    <div
                                        style={{
                                            fontSize: 10,
                                            fontWeight: 700,
                                            letterSpacing: '0.04em',
                                            textTransform: 'uppercase',
                                            color: '#7c3aed',
                                        }}>
                                        Collaborate World
                                    </div>
                                    <div style={{ fontSize: 12, fontWeight: 700, color: '#6d28d9' }}>
                                        {collaborateWorkflow.worldSummary?.activityLabel ?? 'Collaborate'}
                                    </div>
                                    <div
                                        data-testid='collaborate-world-summary'
                                        style={{ display: 'grid', gap: 3, fontSize: 10, color: '#6d28d9' }}>
                                        <span>
                                            Current task:{' '}
                                            <strong style={{ color: '#581c87' }}>
                                                {collaborateWorkflow.worldSummary?.currentTaskLabel ?? 'Awaiting collaboration context'}
                                            </strong>
                                        </span>
                                        <span>
                                            Assistant:{' '}
                                            <strong style={{ color: '#581c87' }}>
                                                Collaborate Assistant
                                            </strong>
                                        </span>
                                        <span>
                                            Linked artifacts:{' '}
                                            <strong style={{ color: '#581c87' }}>
                                                {collaborateWorkflow.worldSummary?.linkedArtifactCount ?? 0}
                                            </strong>{' '}
                                            across{' '}
                                            <strong style={{ color: '#581c87' }}>
                                                {collaborateWorkflow.worldSummary?.clusterCount ?? 0}
                                            </strong>{' '}
                                            collaborate clusters
                                        </span>
                                        <span>
                                            Publish bridge:{' '}
                                            <strong style={{ color: '#581c87' }}>
                                                {collaborateWorkflow.worldSummary?.publishBridgeLabel ?? 'No publish handoff'}
                                            </strong>
                                        </span>
                                        <span>
                                            Collaborate focus:{' '}
                                            <strong style={{ color: '#581c87' }}>
                                                {collaborateShellChoreography.focusState}
                                            </strong>
                                        </span>
                                        <span>
                                            Room behavior:{' '}
                                            <strong style={{ color: '#581c87' }}>
                                                {collaborateShellChoreography.roomState}
                                            </strong>
                                        </span>
                                    </div>
                                </div>
                                <div style={{ fontSize: 11, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                                    Collaborate Workflow
                                </div>
                                <div
                                    data-testid='collaborate-workflow-panel'
                                    data-choreography-state={collaborateShellChoreography.workflowState}
                                    data-context-visibility={collaborateShellChoreography.workflowState === 'yielding' ? 'supporting' : 'expanded'}
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
                                            onClick={() => navigateArtifactWorkflowHref(collaborateWorkflow.suggestedNextArtifact.href)}
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
                                            onClick={() =>
                                                navigateArtifactWorkflowHref(collaborateWorkflow.publishHandoff.href, {
                                                    intentLabel: 'Carry collaboration output into publish review.',
                                                    intentSource: 'workflow',
                                                })
                                            }
                                            data-testid='collaborate-workflow-publish-handoff'
                                            data-choreography-state={collaborateShellChoreography.handoffState}
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
                                                            onClick={() => navigateArtifactWorkflowHref(item.href)}
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
                            </div>
                        ) : null}
                        {perspectiveId === 'publish' ? (
                            <div style={{ padding: 10, borderBottom: '1px solid #e2e8f0' }}>
                                <div
                                    data-testid='publish-room-panel'
                                    data-room-contract='publish-world'
                                    data-room-choreography={publishShellChoreography.roomState}
                                    data-room-workflow={publishShellChoreography.workflowState}
                                    data-room-guidance={publishShellChoreography.assistantState}
                                    data-room-anchor={publishShellChoreography.anchorState}
                                    data-room-focus={publishShellChoreography.focusState}
                                    style={{ display: 'grid', gap: 8 }}>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                                        Publish World
                                    </div>
                                    <div
                                        data-testid='publish-world-panel'
                                        style={{
                                            border: '1px solid #fde68a',
                                            borderRadius: 8,
                                            padding: 8,
                                            background: '#fffbeb',
                                            display: 'grid',
                                            gap: 8,
                                        }}>
                                        <div
                                            style={{
                                                fontSize: 10,
                                                fontWeight: 700,
                                                letterSpacing: '0.04em',
                                                textTransform: 'uppercase',
                                                color: '#b45309',
                                            }}>
                                            Publish World
                                        </div>
                                        <div style={{ fontSize: 12, fontWeight: 700, color: '#92400e' }}>
                                            {publishWorldSummary?.activityLabel ?? 'Publish'}
                                        </div>
                                        <div
                                            data-testid='publish-world-summary'
                                            style={{ display: 'grid', gap: 3, fontSize: 10, color: '#a16207' }}>
                                            <span>
                                                Current task:{' '}
                                                <strong style={{ color: '#78350f' }}>
                                                    {publishWorldSummary?.currentTaskLabel ?? 'Awaiting publish context'}
                                                </strong>
                                            </span>
                                            <span>
                                                Assistant:{' '}
                                                <strong style={{ color: '#78350f' }}>
                                                    {publishAssistantLabels?.assistantLabel ?? 'Publishing Assistant'}
                                                </strong>
                                            </span>
                                            <span>
                                                Context:{' '}
                                                <strong style={{ color: '#78350f' }}>
                                                    {publishWorldSummary?.linkedContextCount ?? 0}
                                                </strong>{' '}
                                                linked publish targets
                                            </span>
                                            <span>
                                                Linked artifacts:{' '}
                                                <strong style={{ color: '#78350f' }}>
                                                    {publishWorldSummary?.linkedArtifactCount ?? 0}
                                                </strong>{' '}
                                                across{' '}
                                                <strong style={{ color: '#78350f' }}>
                                                    {publishWorldSummary?.clusterCount ?? 0}
                                                </strong>{' '}
                                                publish clusters
                                            </span>
                                            <span>
                                                Signals:{' '}
                                                <strong style={{ color: '#78350f' }}>
                                                    {publishWorldSummary?.summaryLabel ?? 'No publish signals'}
                                                </strong>
                                            </span>
                                            <span>
                                                Next focus:{' '}
                                                <strong style={{ color: '#78350f' }}>
                                                    {publishWorldSummary?.nextArtifactLabel ?? 'No linked publish targets'}
                                                </strong>
                                            </span>
                                            <span>
                                                Guidance:{' '}
                                                <strong style={{ color: '#78350f' }}>
                                                    {publishWorldSummary?.assistantSummary ?? 'Publishing Assistant is ready to guide this activity.'}
                                                </strong>
                                            </span>
                                            <span>
                                                Publish focus:{' '}
                                                <strong style={{ color: '#78350f' }}>
                                                    {publishShellChoreography.focusState}
                                                </strong>
                                            </span>
                                            <span>
                                                Room behavior:{' '}
                                                <strong style={{ color: '#78350f' }}>
                                                    {publishShellChoreography.roomState}
                                                </strong>
                                            </span>
                                        </div>
                                    </div>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                                        Publish Workflow
                                    </div>
                                    <div
                                        data-testid='publish-workflow-panel'
                                        data-choreography-state={publishShellChoreography.workflowState}
                                        data-context-visibility={publishShellChoreography.workflowState === 'yielding' ? 'supporting' : 'expanded'}
                                        style={{
                                            border: '1px solid #e2e8f0',
                                            borderRadius: 8,
                                            padding: 8,
                                            background: '#f8fafc',
                                            display: 'grid',
                                            gap: 8,
                                        }}>
                                    {publishWorkflow?.suggestedNextArtifact ? (
                                        <button
                                            type='button'
                                            onClick={() =>
                                                navigateArtifactWorkflowHref(publishWorkflow.suggestedNextArtifact.href, {
                                                    continuityTarget: {
                                                        targetId: publishWorkflow.suggestedNextArtifact.continuityTargetId,
                                                        label: publishWorkflow.suggestedNextArtifact.continuityTargetLabel,
                                                        kind: publishWorkflow.suggestedNextArtifact.continuityTargetKind,
                                                    },
                                                    intentLabel: publishWorkflow.suggestedNextArtifact.continuityIntentLabel,
                                                    intentSource: 'workflow',
                                                })
                                            }
                                            data-testid='publish-workflow-suggested-next'
                                            style={{
                                                textAlign: 'left',
                                                border: '1px solid #fcd34d',
                                                borderRadius: 8,
                                                background: '#fffbeb',
                                                color: '#a16207',
                                                padding: '8px 10px',
                                                cursor: 'pointer',
                                                display: 'grid',
                                                gap: 2,
                                            }}>
                                            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                                                Continue Publishing
                                            </span>
                                            <strong style={{ fontSize: 12, color: '#92400e' }}>
                                                {publishWorkflow.suggestedNextArtifact.label}
                                            </strong>
                                            <span style={{ fontSize: 10 }}>
                                                {publishWorkflow.suggestedNextArtifact.clusterLabel} · {publishWorkflow.suggestedNextArtifact.entryLabel}
                                            </span>
                                        </button>
                                    ) : null}
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                        {(publishWorkflow?.entrySummaries ?? []).map((summary) => (
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
                                        {(publishWorkflow?.artifactClusters ?? []).map((cluster) => (
                                            <div key={cluster.clusterId} data-testid={`publish-workflow-cluster-${cluster.clusterId}`}>
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
                                                            onClick={() =>
                                                                navigateArtifactWorkflowHref(item.href, {
                                                                    continuityTarget: {
                                                                        targetId: item.continuityTargetId,
                                                                        label: item.continuityTargetLabel,
                                                                        kind: item.continuityTargetKind,
                                                                    },
                                                                    intentLabel: item.continuityIntentLabel,
                                                                    intentSource: 'workflow',
                                                                })
                                                            }
                                                            data-testid={`publish-workflow-link-${item.targetId}-${item.entryId}`}
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
                                        {(publishWorkflow?.linkedArtifacts?.length ?? 0) === 0 ? (
                                            <span style={{ fontSize: 11, color: '#64748b' }}>
                                                No linked publish artifacts
                                            </span>
                                        ) : null}
                                    </div>
                                    </div>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                                        Publish Guidance
                                    </div>
                                    <div
                                        data-testid='publish-guidance-panel'
                                        data-choreography-state={publishShellChoreography.assistantState}
                                        style={{
                                            border: '1px solid #dbeafe',
                                            borderRadius: 8,
                                            padding: 8,
                                            background: '#f8fbff',
                                            display: 'grid',
                                            gap: 6,
                                        }}>
                                    <div style={{ fontSize: 12, fontWeight: 700, color: '#1d4ed8' }}>
                                        {publishWorkflow?.assistantGuidance?.assistantLabel ?? 'Publishing Assistant'}
                                    </div>
                                    <div
                                        data-testid='publish-guidance-summary'
                                        style={{ display: 'grid', gap: 3, fontSize: 10, color: '#1e3a8a' }}>
                                        <span>
                                            Current guidance:{' '}
                                            <strong style={{ color: '#1d4ed8' }}>
                                                {publishWorkflow?.assistantGuidance?.assistantSummary ?? 'Publishing Assistant is ready to guide this activity.'}
                                            </strong>
                                        </span>
                                        <span>
                                            Next move:{' '}
                                            <strong style={{ color: '#1d4ed8' }}>
                                                {publishWorkflow?.assistantGuidance?.nextGuidanceLabel ?? 'Keep the publish world anchored.'}
                                            </strong>
                                        </span>
                                        <span>
                                            Release note:{' '}
                                            <strong style={{ color: '#1d4ed8' }}>
                                                {publishWorkflow?.assistantGuidance?.systemGuidanceLabel ?? 'Keep publish intent connected to release evidence.'}
                                            </strong>
                                        </span>
                                    </div>
                                    </div>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                                        Publish Universe Anchor
                                    </div>
                                    <div
                                        data-testid='publish-universe-anchor-panel'
                                        data-choreography-state={publishShellChoreography.anchorState}
                                        style={{
                                            border: '1px solid #cbd5e1',
                                            borderRadius: 8,
                                            padding: 8,
                                            background: '#ffffff',
                                            display: 'grid',
                                            gap: 6,
                                        }}>
                                    <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>
                                        {publishUniverseAnchor?.focusLabel ?? projectWorldAnchor.focusLabel}
                                    </div>
                                    <div
                                        data-testid='publish-universe-anchor-summary'
                                        style={{ display: 'grid', gap: 3, fontSize: 10, color: '#475569' }}>
                                        <span>
                                            Return anchor:{' '}
                                            <strong style={{ color: '#0f172a' }}>
                                                {publishUniverseAnchor?.returnLabel ?? 'Project Hub'}
                                            </strong>
                                        </span>
                                        <span>
                                            Related context:{' '}
                                            <strong style={{ color: '#0f172a' }}>
                                                {publishUniverseAnchor?.relatedCount ?? 0}
                                            </strong>{' '}
                                            linked world targets
                                        </span>
                                        <span>
                                            World flow:{' '}
                                            <strong style={{ color: '#0f172a' }}>
                                                {publishUniverseAnchor?.upstreamCount ?? 0}
                                            </strong>{' '}
                                            upstream ·{' '}
                                            <strong style={{ color: '#0f172a' }}>
                                                {publishUniverseAnchor?.downstreamCount ?? 0}
                                            </strong>{' '}
                                            downstream
                                        </span>
                                        <span>
                                            Next likely world target:{' '}
                                            <strong style={{ color: '#0f172a' }}>
                                                {publishUniverseAnchor?.nextLabel ?? 'Project Hub'}
                                            </strong>
                                        </span>
                                    </div>
                                </div>
                                </div>
                            </div>
                        ) : null}
                        {isCreatePerspective ? null : (
                        <div style={{ padding: 10, borderBottom: '1px solid #e2e8f0' }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                                Assistants
                            </div>
                            <div
                                data-testid='assistant-surface-panel'
                                data-state={assistantSurfaceState}
                                data-choreography-state={assistantSurfaceChoreographyState}
                                data-emergence-source='assistant'
                                data-motion-meaning='context'
                                data-motion-mode={motionMode}
                                style={{
                                    border: '1px solid #e2e8f0',
                                    borderRadius: 6,
                                    padding: '6px 8px',
                                    background: '#f8fafc',
                                    display: 'grid',
                                    gap: 4,
                                }}>
                                {createAssistantLabels || buildAssistantLabels || operateAssistantLabels || publishAssistantLabels ? (
                                    <span
                                        data-testid='assistant-surface-focus'
                                        style={{ fontSize: 10, color: '#334155' }}>
                                        {(createAssistantLabels ?? buildAssistantLabels ?? operateAssistantLabels ?? publishAssistantLabels).assistantLabel} for {formatEntryLabel(projectPerspectiveContext.entryId)}
                                    </span>
                                ) : null}
                                <span
                                    data-testid='assistant-surface-context'
                                    style={{ fontSize: 10, color: '#64748b' }}>
                                    {assistantSurfaceContextSummary}
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
                                <details data-testid='assistant-surface-details'>
                                    <summary style={{ fontSize: 10, color: '#64748b', cursor: 'pointer' }}>
                                        Assistant details
                                    </summary>
                                    <div style={{ display: 'grid', gap: 4, marginTop: 6 }}>
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
                                </details>
                                {assistantIntentStatus ? (
                                    <span style={{ fontSize: 10, color: '#64748b' }}>
                                        assistant intent: {assistantIntentStatus}
                                    </span>
                                ) : null}
                            </div>
                        </div>
                        )}
                        {isCreatePerspective ? (
                            <div
                                data-testid='create-shell-utility-panel'
                                data-state={createShellChoreography.utilityState}
                                data-dominant-context={createShellChoreography.dominantContext}
                                style={{ padding: 10, borderBottom: '1px solid #e2e8f0', display: 'grid', gap: 8 }}>
                                <div style={{ fontSize: 11, fontWeight: 700, color: '#334155' }}>Create Studio</div>
                                <div
                                    data-testid='create-shell-utility-context'
                                    style={{ fontSize: 10, color: '#64748b' }}>
                                    {createShellChoreography.utilitySummary}
                                </div>
                                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                    {[
                                        { id: 'support', label: 'Now' },
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
                                {createUtilityPanel === 'support' ? (
                                    <div style={{ display: 'grid', gap: 8 }}>
                                        <div
                                            data-testid='create-world-panel'
                                            style={{
                                                border: '1px solid #fed7aa',
                                                borderRadius: 8,
                                                padding: '8px 10px',
                                                background: '#fff7ed',
                                                display: 'grid',
                                                gap: 6,
                                            }}>
                                            <div
                                                style={{
                                                    fontSize: 10,
                                                    fontWeight: 700,
                                                    letterSpacing: '0.04em',
                                                    textTransform: 'uppercase',
                                                    color: '#c2410c',
                                                }}>
                                                Create Now
                                            </div>
                                            <div style={{ fontSize: 12, fontWeight: 700, color: '#9a3412' }}>
                                                {createWorkflow.worldSummary?.currentTaskLabel ?? 'Awaiting create context'}
                                            </div>
                                            <div data-testid='create-world-summary' style={{ display: 'grid', gap: 3, fontSize: 10, color: '#9a3412' }}>
                                                <span>
                                                    Focus: <strong style={{ color: '#7c2d12' }}>{createWorkflow.worldSummary?.nextArtifactLabel ?? 'No linked create targets'}</strong>
                                                </span>
                                                <span>
                                                    Assistant: <strong style={{ color: '#7c2d12' }}>{createAssistantLabels?.assistantLabel ?? 'Design Assistant'}</strong>
                                                </span>
                                                <span>
                                                    Linked artifacts: <strong style={{ color: '#7c2d12' }}>{createWorkflow.worldSummary?.linkedArtifactCount ?? 0}</strong>
                                                </span>
                                            </div>
                                            {createWorkflow.suggestedNextArtifact ? (
                                                <button
                                                    type='button'
                                                    onClick={() => navigateArtifactWorkflowHref(createWorkflow.suggestedNextArtifact.href)}
                                                    data-testid='create-workflow-suggested-next'
                                                    style={{
                                                        textAlign: 'left',
                                                        border: '1px solid #fdba74',
                                                        borderRadius: 8,
                                                        background: '#ffffff',
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
                                        </div>
                                        <details
                                            data-testid='assistant-surface-panel'
                                            data-state={assistantSurfaceState}
                                            data-choreography-state={assistantSurfaceChoreographyState}
                                            data-emergence-source='assistant'
                                            data-motion-meaning='context'
                                            data-motion-mode={motionMode}
                                            style={{
                                                border: '1px solid #e2e8f0',
                                                borderRadius: 8,
                                                background: '#f8fafc',
                                                padding: '8px 10px',
                                            }}>
                                            <summary style={{ fontSize: 11, fontWeight: 700, color: '#334155', cursor: 'pointer' }}>
                                                Assistant
                                            </summary>
                                            <div style={{ display: 'grid', gap: 6, marginTop: 8 }}>
                                                <span data-testid='assistant-surface-focus' style={{ fontSize: 10, color: '#334155' }}>
                                                    {(createAssistantLabels ?? buildAssistantLabels ?? operateAssistantLabels ?? publishAssistantLabels)?.assistantLabel ?? 'Design Assistant'} for {formatEntryLabel(projectPerspectiveContext.entryId)}
                                                </span>
                                                <span data-testid='assistant-surface-context' style={{ fontSize: 10, color: '#64748b' }}>
                                                    {assistantSurfaceContextSummary}
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
                                                        {createAssistantLabels?.recommendLabel ?? 'Ask Assistant'}
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
                                                        {createAssistantLabels?.generateLabel ?? 'Generate Options'}
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
                                                        {createAssistantLabels?.explainLabel ?? 'Improve This'}
                                                    </button>
                                                </div>
                                                {assistantIntentStatus ? (
                                                    <span style={{ fontSize: 10, color: '#64748b' }}>
                                                        assistant intent: {assistantIntentStatus}
                                                    </span>
                                                ) : null}
                                            </div>
                                        </details>
                                    </div>
                                ) : null}
                                {createUtilityPanel === 'project' ? (
                                    createShellChoreography.utilityState === 'guiding' ? (
                                        <div style={{ display: 'grid', gap: 8 }}>
                                            <div
                                                style={{
                                                    border: '1px solid #e2e8f0',
                                                    borderRadius: 8,
                                                    padding: '8px 10px',
                                                    background: '#f8fafc',
                                                    display: 'grid',
                                                    gap: 6,
                                                }}>
                                                <div style={{ fontSize: 11, fontWeight: 700, color: '#334155' }}>
                                                    Project Context
                                                </div>
                                                <div style={{ fontSize: 11, color: '#0f172a', fontWeight: 600 }}>
                                                    {projectIdentity.name}
                                                </div>
                                                <div style={{ display: 'grid', gap: 3 }}>
                                                    <span style={{ fontSize: 10, color: '#334155' }}>
                                                        projectId: {projectIdentity.projectId ?? 'none'}
                                                    </span>
                                                    <span style={{ fontSize: 10, color: '#334155' }}>
                                                        blueprint: {projectIdentity.blueprintId ?? 'none'}
                                                    </span>
                                                    <span style={{ fontSize: 10, color: '#334155' }}>
                                                        updated: {formatOptionalDate(projectIdentity.updatedAt)}
                                                    </span>
                                                </div>
                                            </div>
                                            <div
                                                style={{
                                                    border: '1px solid #e2e8f0',
                                                    borderRadius: 8,
                                                    padding: '8px 10px',
                                                    background: '#ffffff',
                                                    display: 'grid',
                                                    gap: 6,
                                                }}>
                                                <div style={{ fontSize: 11, fontWeight: 700, color: '#334155' }}>
                                                    Active Create Entry
                                                </div>
                                                <div style={{ fontSize: 11, color: '#0f172a', fontWeight: 600 }}>
                                                    {formatEntryLabel(projectPerspectiveContext.entryId)}
                                                </div>
                                                <span style={{ fontSize: 10, color: '#64748b' }}>
                                                    Use Navigate for recent routes and universe targets.
                                                </span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div
                                            data-testid='create-shell-utility-receded'
                                            style={{
                                                border: '1px solid #e2e8f0',
                                                borderRadius: 8,
                                                padding: '8px 10px',
                                                background: '#f8fafc',
                                                display: 'grid',
                                                gap: 6,
                                            }}>
                                            <div style={{ fontSize: 11, fontWeight: 700, color: '#334155' }}>
                                                Create Studio is yielding
                                            </div>
                                            <div style={{ fontSize: 11, color: '#0f172a', fontWeight: 600 }}>
                                                {projectIdentity.name} · {formatEntryLabel(projectPerspectiveContext.entryId)}
                                            </div>
                                            <span style={{ fontSize: 10, color: '#64748b' }}>
                                                {createShellChoreography.utilitySummary}
                                            </span>
                                        </div>
                                    )
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
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                gap: 8,
                                                marginTop: 4,
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
                                        <div
                                            data-testid='project-universe-focus-summary'
                                            style={{
                                                border: '1px solid #e2e8f0',
                                                borderRadius: 8,
                                                background: '#f8fafc',
                                                padding: '8px 10px',
                                                display: 'grid',
                                                gap: 2,
                                                marginTop: 6,
                                                marginBottom: 8,
                                            }}>
                                            <div
                                                style={{
                                                    fontSize: 10,
                                                    fontWeight: 700,
                                                    color: '#64748b',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.04em',
                                                }}>
                                                World Focus
                                            </div>
                                            <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>
                                                {focusedUniverseItem?.label ?? 'Project Hub'}
                                            </div>
                                            <div style={{ fontSize: 10, color: '#64748b' }}>
                                                {focusedUniverseItem?.subtitle ?? 'project universe anchor'}
                                            </div>
                                            {focusedUniverseCausality.reliesOn ? (
                                                <div data-testid='project-universe-focus-relies-on' style={{ fontSize: 10, color: '#475569' }}>
                                                    {focusedUniverseCausality.reliesOn}
                                                </div>
                                            ) : null}
                                            {focusedUniverseCausality.influences ? (
                                                <div data-testid='project-universe-focus-influences' style={{ fontSize: 10, color: '#475569' }}>
                                                    {focusedUniverseCausality.influences}
                                                </div>
                                            ) : null}
                                            {focusedUniverseCausality.mattersNext ? (
                                                <div data-testid='project-universe-focus-matters-next' style={{ fontSize: 10, color: '#475569' }}>
                                                    {focusedUniverseCausality.mattersNext}
                                                </div>
                                            ) : null}
                                    </div>
                                    {renderUniverseDominanceValidation({
                                        panelTestId: 'project-universe-dominance-panel-navigate',
                                        summaryTestId: 'project-universe-dominance-summary-navigate',
                                    })}
                                    {renderUniverseAtGlance()}
                                    {renderUniverseGeography()}
                                    {renderUniverseOrientation()}
                                    {renderUniverseWorkflowGuide()}
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
                                                    Active blueprint: {persistedProjectBootstrap.blueprintId ?? 'n/a'}
                                                </span>
                                                <span style={{ fontSize: 10, color: '#334155' }}>
                                                    Version: {persistedProjectBootstrap.blueprintVersionId ?? 'n/a'}
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
                            <div
                                data-testid='project-universe-focus-summary'
                                style={{
                                    border: '1px solid #e2e8f0',
                                    borderRadius: 8,
                                    background: '#f8fafc',
                                    padding: '8px 10px',
                                    display: 'grid',
                                    gap: 2,
                                    marginBottom: 8,
                                }}>
                                <div
                                    style={{
                                        fontSize: 10,
                                        fontWeight: 700,
                                        color: '#64748b',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.04em',
                                    }}>
                                    World Focus
                                </div>
                                <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>
                                    {focusedUniverseItem?.label ?? 'Project Hub'}
                                </div>
                                <div style={{ fontSize: 10, color: '#64748b' }}>
                                    {focusedUniverseItem?.subtitle ?? 'project universe anchor'}
                                </div>
                                {focusedUniverseCausality.reliesOn ? (
                                    <div data-testid='project-universe-focus-relies-on' style={{ fontSize: 10, color: '#475569' }}>
                                        {focusedUniverseCausality.reliesOn}
                                    </div>
                                ) : null}
                                {focusedUniverseCausality.influences ? (
                                    <div data-testid='project-universe-focus-influences' style={{ fontSize: 10, color: '#475569' }}>
                                        {focusedUniverseCausality.influences}
                                    </div>
                                ) : null}
                                {focusedUniverseCausality.mattersNext ? (
                                    <div data-testid='project-universe-focus-matters-next' style={{ fontSize: 10, color: '#475569' }}>
                                        {focusedUniverseCausality.mattersNext}
                                    </div>
                                ) : null}
                            </div>
                            {renderUniverseDominanceValidation({
                                panelTestId: 'project-universe-dominance-panel-mobile',
                                summaryTestId: 'project-universe-dominance-summary-mobile',
                            })}
                            {renderUniverseAtGlance()}
                            {renderUniverseGeography()}
                            {renderUniverseOrientation()}
                            {renderUniverseWorkflowGuide()}
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
                    <div style={{ minHeight: 0, minWidth: 0 }}>{children}</div>
                </div>
            </div>
        </div>
    );
}
