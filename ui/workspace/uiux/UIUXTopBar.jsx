'use client';

import { normalizeDesignModeId, DesignWorkspaceBrand } from '@/ui/workspace/design/DesignShellPrimitives.jsx';

export function UIUXTopBar({ modeId = 'uiux', templatesOpen = false, onToggleTemplates, onPublish = null }) {
    const resolvedModeId = normalizeDesignModeId(modeId);
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
                <button type='button'>Frame</button>

                <button type='button'>Auto Layout</button>

                <button type='button'>100%</button>

                <span className='frame-indicator'>Draft Surface</span>
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
