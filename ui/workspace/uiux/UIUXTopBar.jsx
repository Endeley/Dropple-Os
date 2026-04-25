'use client';

export function UIUXTopBar({ templatesOpen = false, onToggleTemplates, onPublish = null }) {
    return (
        <header className='uiux-topbar'>
            <div className='uiux-topbar-left'>
                <span className='workspace-name'>UI/UX Design</span>
            </div>

            <div className='uiux-topbar-center'>
                <span className='frame-indicator'>Frame: -</span>
            </div>

            <div className='uiux-topbar-right'>
                <button
                    type='button'
                    onClick={onToggleTemplates}
                    style={{
                        marginRight: 8,
                        borderRadius: 8,
                        padding: '6px 10px',
                        border: '1px solid #cbd5f5',
                        background: templatesOpen ? '#e2e8f0' : '#f8fafc',
                        cursor: 'pointer',
                    }}>
                    Templates
                </button>
                <button type='button' onClick={onPublish} disabled={typeof onPublish !== 'function'}>
                    Publish
                </button>
            </div>
        </header>
    );
}
