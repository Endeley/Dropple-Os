'use client';

import {
    normalizeDesignModeId,
    DesignWorkspaceBrand,
    resolveDesignTopChrome,
    resolveDesignModeLabel,
} from '@/ui/workspace/design/DesignShellPrimitives.jsx';

export function UIUXTopBar({ modeId = 'uiux', templatesOpen = false, onToggleTemplates, onPublish = null }) {
    const resolvedModeId = normalizeDesignModeId(modeId);
    const topChrome = resolveDesignTopChrome(resolvedModeId);
    const modeLabel = resolveDesignModeLabel(resolvedModeId);

    return (
        <header className='uiux-topbar' data-testid='uiux-topbar' data-editor-unity='world-based'>
            {/* Left — editor controls */}
            <div className='uiux-topbar-left' data-testid='uiux-topbar-editor-group' aria-label='Editor controls'>
                <DesignWorkspaceBrand modeId={resolvedModeId} />
                <span className='uiux-topbar-group-label'>Editor</span>

                <button type='button'>File</button>

                <button type='button'>Edit</button>

                <button type='button'>View</button>

                <button type='button'>Prototype</button>
            </div>

            {/* Center — authoring controls */}
            <div className='uiux-topbar-center' data-testid='uiux-topbar-authoring-group' aria-label='Authoring controls'>
                <span className='uiux-topbar-group-label'>Authoring</span>
                <button type='button'>{topChrome.primaryActionLabel}</button>

                <button type='button'>{topChrome.secondaryActionLabel}</button>

                <button type='button'>{topChrome.zoomLabel}</button>

                <span className='frame-indicator'>{topChrome.surfaceLabel}</span>
            </div>

            {/* Right — project actions */}
            <div className='uiux-topbar-right' data-testid='uiux-topbar-project-group' aria-label='Project actions'>
                <span className='uiux-topbar-group-label'>Project</span>
                <button type='button' onClick={onToggleTemplates} aria-pressed={templatesOpen}>
                    Templates
                </button>

                <button type='button'>Share</button>

                <button type='button' onClick={onPublish} disabled={typeof onPublish !== 'function'}>
                    Publish
                </button>
            </div>

            <div className='uiux-topbar-unity-summary' data-testid='uiux-topbar-unity-summary'>
                <span>World Editor</span>
                <span>{modeLabel}</span>
                <span>{topChrome.surfaceLabel}</span>
            </div>
        </header>
    );
}
