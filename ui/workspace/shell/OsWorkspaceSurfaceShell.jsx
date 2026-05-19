'use client';

import { useEffect, useState } from 'react';
import { useDispatcher } from '@/ui/workspace/DispatcherContext.jsx';
import { readOsWorkspaceShellSurfaceModel } from '@/ui/bridges/osSurfaceReadBridge.js';
import { dispatchOsWorkspaceShellIntent } from '@/ui/bridges/osSurfaceIntentBridge.js';

function readModel() {
    try {
        return readOsWorkspaceShellSurfaceModel();
    } catch {
        return null;
    }
}

export function OsWorkspaceSurfaceShell() {
    const dispatcher = useDispatcher();
    const [model, setModel] = useState(() => readModel());

    useEffect(() => {
        setModel(readModel());
        const timer = setInterval(() => {
            setModel(readModel());
        }, 400);
        return () => clearInterval(timer);
    }, []);

    if (!model) return null;

    const activateSelect = () => {
        dispatchOsWorkspaceShellIntent(
            {
                action: 'tool.activate',
                toolId: 'select',
            },
            dispatcher,
        );
    };

    const resetViewport = () => {
        dispatchOsWorkspaceShellIntent(
            {
                action: 'viewport.set',
                viewport: { x: 0, y: 0, zoom: 1 },
            },
            dispatcher,
        );
    };

    return (
        <div
            aria-label='OS Surface Shell'
            style={{
                position: 'absolute',
                top: 12,
                right: 12,
                zIndex: 1000,
                background: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: 8,
                boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                padding: 10,
                minWidth: 260,
                fontSize: 12,
                lineHeight: 1.35,
            }}>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>OS Surface</div>
            <div>Workspace: {model.workspaceId ?? 'n/a'}</div>
            <div>Mode: {model.modeId ?? 'n/a'}</div>
            <div>Session: {model.sessionId ?? 'n/a'}</div>
            <div>Participants: {model.participantIds.length}</div>
            <div style={{ marginBottom: 8 }}>Trust: {model.releaseTrustHash ? 'present' : 'n/a'}</div>
            <div style={{ display: 'flex', gap: 6 }}>
                <button
                    type='button'
                    onClick={activateSelect}
                    style={{ border: '1px solid #d1d5db', borderRadius: 6, padding: '4px 8px', background: '#f9fafb' }}>
                    Activate Select
                </button>
                <button
                    type='button'
                    onClick={resetViewport}
                    style={{ border: '1px solid #d1d5db', borderRadius: 6, padding: '4px 8px', background: '#f9fafb' }}>
                    Reset View
                </button>
            </div>
        </div>
    );
}
