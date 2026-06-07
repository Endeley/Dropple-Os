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
    modeId = 'uiux',
    status = 'Draft',
    activity = 'Canvas-first authoring',
    selectionCount = 0,
    timelineState = 'compact',
}) {
    const selectionSummary =
        selectionCount === 1 ? '1 selected node' : `${selectionCount} selected nodes`;
    const timelineSummary = timelineState === 'expanded' ? 'Timeline active' : 'Timeline waiting';

    return (
        <div className='uiux-workspace-strip' data-testid='uiux-workspace-strip'>
            <div className='uiux-workspace-strip-leading'>
                <div className='uiux-breadcrumb'>Create &gt; {resolveDesignModeLabel(modeId)}</div>
                <div className='uiux-workspace-activity' data-testid='uiux-workspace-activity'>
                    {activity}
                </div>
            </div>
            <div className='uiux-surface-controls' data-testid='uiux-workspace-status'>
                <span>{status}</span>
                <span>{selectionSummary}</span>
                <span>{timelineSummary}</span>
            </div>
        </div>
    );
}

export function DesignWorkspaceBrand({ modeId = 'uiux' }) {
    return (
        <div className='workspace-brand'>
            <span className='workspace-name'>Create</span>
            <span className='workspace-mode'>{resolveDesignModeLabel(modeId)}</span>
        </div>
    );
}
