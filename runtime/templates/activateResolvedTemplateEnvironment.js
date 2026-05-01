import { buildRuntimeSnapshotFromCertifiedTemplate } from '@/domain/templates/buildRuntimeSnapshotFromCertifiedTemplate.js';
import { hydrateRuntimeSnapshot } from '@/runtime/commands/hydrateRuntimeSnapshot.js';
import {
    applyViewportUpdate,
    createDefaultWorkspaceState,
} from '@/runtime/state/workspaceRuntime.js';

function createActivatedWorkspaceState(modeContext, runtimeConfig = {}) {
    if (
        runtimeConfig.mode != null &&
        runtimeConfig.mode !== modeContext.modeId
    ) {
        throw new Error(
            `Template environment activation failed: runtimeConfig.mode ${runtimeConfig.mode} does not match modeContext.modeId ${modeContext.modeId}.`,
        );
    }

    let workspaceState = {
        ...createDefaultWorkspaceState(),
        id: modeContext.workspaceId,
        workspaceId: modeContext.workspaceId,
        modeId: modeContext.modeId,
        overlayId: modeContext.overlayId ?? null,
    };

    if (runtimeConfig.viewport) {
        workspaceState = applyViewportUpdate(workspaceState, {
            x: runtimeConfig.viewport.offset?.x ?? workspaceState.viewport?.x ?? 0,
            y: runtimeConfig.viewport.offset?.y ?? workspaceState.viewport?.y ?? 0,
            scale: runtimeConfig.viewport.zoom ?? workspaceState.viewport?.scale ?? 1,
        });
    }

    return {
        ...workspaceState,
        modeId: modeContext.modeId,
        overlayId: modeContext.overlayId ?? null,
    };
}

export function buildRuntimeSnapshotFromTemplateEnvironment({
    template,
    resolvedEnvironment,
    environmentId = null,
}) {
    const runtimeSnapshot = buildRuntimeSnapshotFromCertifiedTemplate(template);
    const modeContext = resolvedEnvironment.modeContext;
    const runtimeConfig = resolvedEnvironment.runtimeConfig ?? {};
    const playbackTime = Number.isFinite(runtimeConfig.playback?.time)
        ? Number(runtimeConfig.playback.time)
        : null;
    const playbackPaused = runtimeConfig.playback?.paused;
    const nextDocument =
        runtimeSnapshot.document && typeof runtimeSnapshot.document === 'object'
            ? {
                  ...runtimeSnapshot.document,
                  meta: {
                      ...(runtimeSnapshot.document.meta ?? {}),
                      id:
                          environmentId ??
                          runtimeSnapshot.document.meta?.id ??
                          null,
                  },
              }
            : runtimeSnapshot.document;

    return {
        ...runtimeSnapshot,
        document: nextDocument,
        workspace: createActivatedWorkspaceState(modeContext, runtimeConfig),
        playback: {
            ...(runtimeSnapshot.playback ?? {}),
            ...(playbackTime != null
                ? {
                      time: playbackTime,
                      timeMs: playbackTime,
                      frame: playbackTime,
                  }
                : {}),
            ...(typeof playbackPaused === 'boolean'
                ? { isPlaying: !playbackPaused }
                : {}),
        },
    };
}

export function activateResolvedTemplateEnvironment({
    resolved,
    dispatcher,
    animate = false,
} = {}) {
    if (!dispatcher?.hydrateRuntimeState) {
        throw new Error('Template environment activation requires a dispatcher with hydrateRuntimeState().');
    }

    const runtimeSnapshot = buildRuntimeSnapshotFromTemplateEnvironment({
        template: resolved.template,
        resolvedEnvironment: resolved.resolvedEnvironment,
        environmentId: resolved.environmentId,
    });
    const playbackTime = Number.isFinite(resolved.resolvedEnvironment.runtimeConfig?.playback?.time)
        ? Number(resolved.resolvedEnvironment.runtimeConfig.playback.time)
        : -1;

    const hydration = hydrateRuntimeSnapshot({
        dispatcher,
        snapshot: {
            runtimeSnapshot,
            events: [],
            cursorIndex: playbackTime,
        },
        animate,
        workspace: resolved.resolvedEnvironment.modeContext.workspaceId,
        mode: resolved.resolvedEnvironment.modeContext.modeId,
    });

    return {
        activated: true,
        environmentId: resolved.environmentId,
        descriptor: resolved.descriptor,
        template: resolved.template,
        resolvedEnvironment: resolved.resolvedEnvironment,
        runtimeSnapshot,
        hydratedState: hydration.runtimeSnapshot,
    };
}
