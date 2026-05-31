'use client';

import {
    normalizeDesignModeId,
    DesignWorkspaceBrand,
    resolveDesignTopChrome,
} from '@/ui/workspace/design/DesignShellPrimitives.jsx';

export function UIUXTopBar({ modeId = 'uiux', templatesOpen = false, onToggleTemplates, onPublish = null }) {
    const resolvedModeId = normalizeDesignModeId(modeId);
    const topChrome = resolveDesignTopChrome(resolvedModeId);
    return (
        <header className='uiux-topbar'>
            {/* Left — file / workspace */}
            <div className='uiux-topbar-left'>
                <DesignWorkspaceBrand modeId={resolvedModeId} />

                <button type='button'>File</button>

                <button type='button'>Edit</button>

                <button type='button'>View</button>

                <button type='button'>Prototype</button>
            </div>

            {/* Center — canvas controls */}
            <div className='uiux-topbar-center'>
                <button type='button'>{topChrome.primaryActionLabel}</button>

                <button type='button'>{topChrome.secondaryActionLabel}</button>

                <button type='button'>{topChrome.zoomLabel}</button>

                <span className='frame-indicator'>{topChrome.surfaceLabel}</span>
            </div>

            {/* Right — publish + templates */}
            <div className='uiux-topbar-right'>
                <button type='button' onClick={onToggleTemplates} aria-pressed={templatesOpen}>
                    Templates
                </button>

                <button type='button'>Share</button>

                <button type='button' onClick={onPublish} disabled={typeof onPublish !== 'function'}>
                    Publish
                </button>
            </div>
        </header>
    );
}
