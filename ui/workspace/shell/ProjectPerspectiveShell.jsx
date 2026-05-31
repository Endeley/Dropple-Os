'use client';

import { useMemo } from 'react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    getProjectPerspectiveDefinition,
    listProjectPerspectiveIds,
} from '@/platform/workspaces/projectPerspectiveRouter.js';
import { useCommandPalette } from '@/commands/useCommandPalette';
import { CommandPalette } from '@/commands/CommandPalette';
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

    const router = useRouter();
    const perspectiveId = projectPerspectiveContext.perspectiveId;
    const perspectiveLabel = projectPerspectiveContext.perspectiveLabel;
    const perspectiveIds = listProjectPerspectiveIds();
    const perspectiveDefinition = getProjectPerspectiveDefinition(perspectiveId);
    const perspectiveEntries = perspectiveDefinition?.entries ?? [];
    const { open: commandOpen, close: commandClose } = useCommandPalette({ enabled: true });
    const [navigatorQuery, setNavigatorQuery] = useState('');
    const [recentRoutes, setRecentRoutes] = useState(() => []);

    const activeRoute = `/workspace/${perspectiveId}?entry=${projectPerspectiveContext.entryId}`;

    useEffect(() => {
        setRecentRoutes((previous) => {
            const next = [activeRoute, ...previous.filter((entry) => entry !== activeRoute)];
            return next.slice(0, 8);
        });
    }, [activeRoute]);

    const perspectiveCommands = useMemo(() => {
        const commands = [];

        for (const id of perspectiveIds) {
            const definition = getProjectPerspectiveDefinition(id);
            if (!definition) continue;
            commands.push({
                id: `perspective:${id}`,
                title: `Go to ${definition.label}`,
                category: 'Perspective',
                keywords: ['project', 'perspective', id, definition.label],
                run: () => router.push(`/workspace/${id}`),
            });
            for (const entryId of definition.entries ?? []) {
                commands.push({
                    id: `entry:${id}:${entryId}`,
                    title: `Open ${definition.label} / ${formatEntryLabel(entryId)}`,
                    category: 'Entry',
                    keywords: ['project', 'entry', id, entryId, definition.label],
                    run: () => router.push(`/workspace/${id}?entry=${entryId}`),
                });
            }
        }

        return commands;
    }, [router, perspectiveIds]);

    const navigatorItems = useMemo(() => {
        const all = [];
        for (const id of perspectiveIds) {
            const definition = getProjectPerspectiveDefinition(id);
            if (!definition) continue;
            for (const entryId of definition.entries ?? []) {
                all.push(
                    Object.freeze({
                        id: `${id}:${entryId}`,
                        perspectiveId: id,
                        perspectiveLabel: definition.label,
                        entryId,
                        label: `${definition.label} / ${formatEntryLabel(entryId)}`,
                        href: `/workspace/${id}?entry=${entryId}`,
                    }),
                );
            }
        }
        const normalizedQuery = navigatorQuery.trim().toLowerCase();
        if (!normalizedQuery) return all;
        return all.filter(
            (item) =>
                item.label.toLowerCase().includes(normalizedQuery) ||
                item.perspectiveId.includes(normalizedQuery) ||
                item.entryId.includes(normalizedQuery),
        );
    }, [navigatorQuery, perspectiveIds]);

    return (
        <div style={{ display: 'grid', gridTemplateRows: 'auto auto auto 1fr', height: '100%' }}>
            {commandOpen && (
                <CommandPalette
                    commands={perspectiveCommands}
                    context={{
                        selected: [],
                        mode: activeModeId ?? projectPerspectiveContext.modeId,
                        readOnly: false,
                        authenticated: true,
                    }}
                    onClose={commandClose}
                />
            )}
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
                <div style={{ minHeight: 0, display: 'grid', gridTemplateColumns: '280px minmax(0, 1fr)' }}>
                    <aside
                        style={{
                            borderRight: '1px solid #e2e8f0',
                            background: '#ffffff',
                            minHeight: 0,
                            overflow: 'auto',
                        }}>
                        <div style={{ padding: 10, borderBottom: '1px solid #e2e8f0' }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>
                                Navigator
                            </div>
                            <input
                                aria-label='Navigator search'
                                value={navigatorQuery}
                                onChange={(event) => setNavigatorQuery(event.target.value)}
                                placeholder='Search perspectives or entries'
                                style={{
                                    width: '100%',
                                    border: '1px solid #cbd5e1',
                                    borderRadius: 6,
                                    padding: '6px 8px',
                                    fontSize: 12,
                                }}
                            />
                        </div>
                        <div style={{ padding: 10, borderBottom: '1px solid #e2e8f0' }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                                Recent
                            </div>
                            <div style={{ display: 'grid', gap: 4 }}>
                                {recentRoutes.length === 0 ? (
                                    <span style={{ fontSize: 11, color: '#64748b' }}>No recent routes</span>
                                ) : (
                                    recentRoutes.map((href) => (
                                        <Link
                                            key={href}
                                            href={href}
                                            style={{
                                                fontSize: 11,
                                                color: href === activeRoute ? '#0f172a' : '#334155',
                                                textDecoration: 'none',
                                                padding: '4px 6px',
                                                borderRadius: 6,
                                                background: href === activeRoute ? '#e2e8f0' : 'transparent',
                                            }}>
                                            {href.replace('/workspace/', '')}
                                        </Link>
                                    ))
                                )}
                            </div>
                        </div>
                        <div style={{ padding: 10 }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                                All Entries
                            </div>
                            <div style={{ display: 'grid', gap: 4 }}>
                                {navigatorItems.map((item) => {
                                    const active = item.href === activeRoute;
                                    return (
                                        <Link
                                            key={item.id}
                                            href={item.href}
                                            style={{
                                                fontSize: 11,
                                                color: active ? '#0f172a' : '#334155',
                                                textDecoration: 'none',
                                                padding: '4px 6px',
                                                borderRadius: 6,
                                                border: `1px solid ${active ? '#0f172a' : '#e2e8f0'}`,
                                                background: active ? '#f8fafc' : '#ffffff',
                                            }}>
                                            {item.label}
                                        </Link>
                                    );
                                })}
                                {navigatorItems.length === 0 ? (
                                    <span style={{ fontSize: 11, color: '#64748b' }}>No matches</span>
                                ) : null}
                            </div>
                        </div>
                    </aside>
                    <div style={{ minHeight: 0 }}>{children}</div>
                </div>
            </div>
        </div>
    );
}
