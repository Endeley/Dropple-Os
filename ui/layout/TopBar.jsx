'use client';

import { canvasBus } from '@/ui/eventBus/canvasBus.js';

export default function TopBar({
    workspaceLabel = 'Design',
    modeLabel,
    documentName = 'Untitled',
    readOnly = false,
    shellStatus = null,
}) {
    const emit = (type, payload = {}) => {
        canvasBus.emit(type, payload);
    };

    const hasShellStatus = shellStatus && typeof shellStatus === 'object';
    const trustState = hasShellStatus && shellStatus.releaseTrustHash ? 'trusted' : 'unverified';
    const presenceCount = hasShellStatus && Number.isFinite(shellStatus.participantCount)
        ? Number(shellStatus.participantCount)
        : 0;
    const sessionState = hasShellStatus && shellStatus.sessionId ? 'live' : 'offline';

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
                            {' > '}
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
                {hasShellStatus && (
                    <div
                        aria-label='OS Shell Status'
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: '4px 8px',
                            borderRadius: 999,
                            border: '1px solid #d1d5db',
                            background: '#f8fafc',
                            color: '#0f172a',
                            fontSize: 11,
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.02em',
                            marginRight: 8,
                        }}>
                        <span>Session: {sessionState}</span>
                        <span>Peers: {presenceCount}</span>
                        <span>Trust: {trustState}</span>
                    </div>
                )}
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
