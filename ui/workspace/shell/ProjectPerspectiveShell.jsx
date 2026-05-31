'use client';

import Link from 'next/link';
import {
    getProjectPerspectiveDefinition,
    listProjectPerspectiveIds,
} from '@/platform/workspaces/projectPerspectiveRouter.js';
import { ProjectUniverseCanvas } from './ProjectUniverseCanvas.jsx';

function formatEntryLabel(entryId) {
    return String(entryId)
        .split('-')
        .map((part) => (part ? part[0].toUpperCase() + part.slice(1) : part))
        .join(' ');
}

export function ProjectPerspectiveShell({
    projectPerspectiveContext = null,
    activeModeId = null,
    children = null,
}) {
    if (!projectPerspectiveContext) return children;

    const perspectiveId = projectPerspectiveContext.perspectiveId;
    const perspectiveLabel = projectPerspectiveContext.perspectiveLabel;
    const perspectiveIds = listProjectPerspectiveIds();
    const perspectiveDefinition = getProjectPerspectiveDefinition(perspectiveId);
    const perspectiveEntries = perspectiveDefinition?.entries ?? [];

    return (
        <div style={{ display: 'grid', gridTemplateRows: 'auto auto auto 1fr', height: '100%' }}>
            <header
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 10,
                    padding: '10px 14px',
                    borderBottom: '1px solid #e2e8f0',
                    background: '#ffffff',
                }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <strong style={{ fontSize: 14, color: '#0f172a' }}>Project Space</strong>
                    <span style={{ fontSize: 12, color: '#475569' }}>
                        {perspectiveLabel} · {projectPerspectiveContext.entryId}
                    </span>
                </div>
                <span style={{ fontSize: 11, color: '#64748b' }}>
                    workspace: {projectPerspectiveContext.workspaceId}/
                    {activeModeId ?? projectPerspectiveContext.modeId}
                </span>
            </header>
            <nav
                aria-label='Project perspectives'
                style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 6,
                    padding: '8px 12px',
                    borderBottom: '1px solid #e2e8f0',
                    background: '#f8fafc',
                }}>
                {perspectiveIds.map((id) => {
                    const active = id === perspectiveId;
                    return (
                        <Link
                            key={id}
                            href={`/workspace/${id}`}
                            style={{
                                padding: '6px 10px',
                                borderRadius: 999,
                                fontSize: 12,
                                textDecoration: 'none',
                                border: `1px solid ${active ? '#0f172a' : '#cbd5e1'}`,
                                color: active ? '#ffffff' : '#334155',
                                background: active ? '#0f172a' : '#ffffff',
                            }}>
                            {id}
                        </Link>
                    );
                })}
            </nav>
            <nav
                aria-label={`${perspectiveLabel} entries`}
                style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 6,
                    padding: '8px 12px',
                    borderBottom: '1px solid #e2e8f0',
                    background: '#ffffff',
                }}>
                {perspectiveEntries.map((entryId) => {
                    const active = entryId === projectPerspectiveContext.entryId;
                    return (
                        <Link
                            key={entryId}
                            href={`/workspace/${perspectiveId}?entry=${entryId}`}
                            style={{
                                padding: '4px 8px',
                                borderRadius: 8,
                                fontSize: 11,
                                textDecoration: 'none',
                                border: `1px solid ${active ? '#0f172a' : '#d1d5db'}`,
                                color: active ? '#0f172a' : '#475569',
                                background: active ? '#e2e8f0' : '#ffffff',
                            }}>
                            {formatEntryLabel(entryId)}
                        </Link>
                    );
                })}
            </nav>
            <div style={{ minHeight: 0, display: 'grid', gridTemplateRows: 'auto 1fr' }}>
                <ProjectUniverseCanvas perspectiveId={perspectiveId} />
                <div style={{ minHeight: 0 }}>{children}</div>
            </div>
        </div>
    );
}
