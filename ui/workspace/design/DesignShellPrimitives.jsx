'use client';

export {
    normalizeDesignModeId,
    resolveDesignModeLabel,
    resolveDesignTopChrome,
    resolveDesignWorkspaceContext,
    buildDesignPublishModePayload,
} from './DesignShellPrimitivesCore.js';
import { resolveDesignModeLabel } from './DesignShellPrimitivesCore.js';

export function DesignWorkspaceStrip({ modeId = 'uiux', status = 'Draft' }) {
    return (
        <div className='uiux-workspace-strip'>
            <div className='uiux-breadcrumb'>Design / {resolveDesignModeLabel(modeId)}</div>
            <div className='uiux-surface-controls'>{status}</div>
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
