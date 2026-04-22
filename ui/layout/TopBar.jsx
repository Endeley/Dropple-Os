'use client';

import { canvasBus } from '@/ui/eventBus/canvasBus.js';

export default function TopBar({ workspaceLabel = 'Design', modeLabel, documentName = 'Untitled', readOnly = false }) {
    const emit = (type, payload = {}) => {
        canvasBus.emit(type, payload);
    };

    return (
        <div className='topbar-root'>
            {/* LEFT: Identity */}
            <div className='topbar-left'>
                <div className='topbar-brand'>Dropple</div>

                <div className='topbar-divider' />

                <div className='topbar-workspace'>
                    {workspaceLabel}
                    {modeLabel && (
                        <span className='topbar-mode'>
                            {' · '}
                            {modeLabel}
                        </span>
                    )}
                </div>
            </div>

            {/* CENTER: Document */}
            <div className='topbar-center'>
                <div className='topbar-document'>{documentName || 'Untitled'}</div>
            </div>

            {/* RIGHT: Actions */}
            <div className='topbar-right'>
                {!readOnly && (
                    <>
                        <button className='topbar-btn primary' onClick={() => emit('intent.document.save')}>
                            Save
                        </button>

                        <button className='topbar-btn' onClick={() => emit('intent.document.export')}>
                            Export
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
