import {
    selectCanvasSurface,
    selectRenderState,
    selectSequencerPreview,
    selectViewport,
} from '@/runtime/projection/index.js';
import { resolveInitialProjectPerspectiveContext } from '@/platform/workspaces/projectPerspectiveRouter.js';
import { resolvePerspectiveAssistants } from '@/runtime/assistants/resolvePerspectiveAssistants.js';
import { buildAssistantSurfaceModel } from './buildAssistantSurfaceModel.js';
import { buildEnvironmentSurfaceModel } from './buildEnvironmentSurfaceModel.js';
import { buildSynthesizedToolSurfaceModel } from './buildSynthesizedToolSurfaceModel.js';

function toCapabilityOverlays(policy) {
    if (!policy || typeof policy !== 'object') return [];
    const overlays = policy.mode?.overlays ?? policy.overlays ?? [];
    return Array.isArray(overlays) ? overlays : [];
}

function toParticipantIds(presence) {
    if (Array.isArray(presence)) {
        return presence
            .map((entry) => entry?.userId)
            .filter((value) => typeof value === 'string' && value.trim().length > 0)
            .sort((left, right) => left.localeCompare(right));
    }

    if (presence && typeof presence === 'object') {
        return Object.values(presence)
            .map((entry) => entry?.userId)
            .filter((value) => typeof value === 'string' && value.trim().length > 0)
            .sort((left, right) => left.localeCompare(right));
    }

    return [];
}

function toToolEntries(visibleToolDefinitions) {
    if (!visibleToolDefinitions || typeof visibleToolDefinitions !== 'object') return [];
    return Object.entries(visibleToolDefinitions)
        .map(([toolId, definition]) => ({
            toolId,
            semanticId: definition?.descriptor?.semanticId ?? null,
            winnerSource: definition?.winnerSource ?? null,
            winnerPriority: definition?.winnerPriority ?? 0,
            ownerSources: Array.isArray(definition?.owners) ? definition.owners : [],
            capabilityTags: Array.isArray(definition?.descriptor?.capabilityTags)
                ? definition.descriptor.capabilityTags
                : [],
            defaultActive: definition?.descriptor?.defaultActive === true,
            executionSignature: definition?.descriptor?.executionSignature ?? null,
            migrationWindowId: definition?.descriptor?.migrationWindowId ?? null,
        }))
        .sort((left, right) => String(left.toolId).localeCompare(String(right.toolId)));
}

export function buildEnvironmentSurfaceModelFromProjection(projected = null) {
    const renderState = projected ?? selectRenderState() ?? {};
    const workspace = renderState.workspace ?? {};
    const sequencer = selectSequencerPreview() ?? {};

    return buildEnvironmentSurfaceModel({
        runtime: {
            activeEnvironmentId: workspace.profile?.environmentId ?? workspace.profile?.id ?? null,
            activeSessionId: renderState?.collaboration?.session?.id ?? null,
            executionTopology: {
                hasTimeline: Boolean(renderState?.timeline),
                renderNodeCount: Object.keys(renderState?.viewNodes ?? {}).length,
                sequenceId: sequencer?.sequenceId ?? null,
                frame: Number(sequencer?.frame ?? 0),
            },
        },
        workspace: {
            workspaceId: workspace.id ?? null,
            modeId: workspace.mode ?? workspace.policy?.mode?.id ?? null,
            capabilityOverlays: toCapabilityOverlays(workspace.policy),
        },
        federation: {
            participantIds: toParticipantIds(renderState?.collaboration?.presence),
            sessionPhase: renderState?.collaboration?.session?.phase ?? null,
            lineageHash: renderState?.federationAudit?.hash ?? null,
            attestationHash: renderState?.federationAudit?.hash ?? null,
        },
        trust: {
            releaseTrustHash: renderState?.federationAudit?.hash ?? null,
            federationLineageLedgerHead: renderState?.federationAudit?.hash ?? null,
        },
        viewport: selectViewport(),
        canvasSurface: selectCanvasSurface(),
    });
}

export function buildSynthesizedToolSurfaceModelFromProjection(projected = null) {
    const renderState = projected ?? selectRenderState() ?? {};
    return buildSynthesizedToolSurfaceModel({
        activeToolId: renderState?.tools?.activeTool ?? null,
        tools: toToolEntries(renderState?.tools?.visibleToolDefinitions ?? {}),
    });
}

export function buildAssistantSurfaceModelFromProjection(projected = null) {
    const renderState = projected ?? selectRenderState() ?? {};
    const perspectiveContext = resolveInitialProjectPerspectiveContext({
        document: renderState?.document,
    });
    const resolved = resolvePerspectiveAssistants({
        perspectiveId: perspectiveContext?.perspectiveId,
        entryId: perspectiveContext?.entryId,
    });

    return buildAssistantSurfaceModel({
        perspectiveId: resolved?.perspectiveId ?? null,
        activeAssistantId: resolved?.activeAssistantId ?? null,
        assistantIds: Array.isArray(resolved?.assistants)
            ? resolved.assistants.map((entry) => entry?.id)
            : [],
    });
}
