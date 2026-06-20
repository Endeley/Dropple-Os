'use client';

export {
    normalizeDesignModeId,
    resolveDesignModeLabel,
    resolveDesignTopChrome,
    resolveDesignWorkspaceContext,
    buildDesignPublishModePayload,
    resolveDesignModeCapabilitySurface,
} from './DesignShellPrimitivesCore.js';
import { resolveDesignModeLabel } from './DesignShellPrimitivesCore.js';

export function DesignWorkspaceStrip({
    status = 'Draft',
    selectionCount = 0,
    timelineState = 'compact',
    showSelection = true,
    showTimeline = true,
}) {
    const selectionSummary = selectionCount === 1 ? '1 selected node' : `${selectionCount} selected nodes`;
    const hasSelection = showSelection && selectionCount > 0;
    const hasTimeline = showTimeline && timelineState === 'expanded';

    return (
        <div className='uiux-workspace-strip' data-testid='uiux-workspace-strip'>
            <div className='uiux-surface-controls' data-testid='uiux-workspace-status'>
                <span>{status}</span>
                {hasSelection ? <span>{selectionSummary}</span> : null}
                {hasTimeline ? <span>Timeline active</span> : null}
            </div>
        </div>
    );
}

export function DesignWorkspaceBrand({ modeId = 'uiux' }) {
    return (
        <div className='workspace-brand'>
            <span className='workspace-name'>{resolveDesignModeLabel(modeId)}</span>
        </div>
    );
}
