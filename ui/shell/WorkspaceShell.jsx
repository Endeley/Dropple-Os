'use client';

import { useRouter, usePathname } from 'next/navigation';
import CanvasRoot from '@/ui/canvas/CanvasRoot.jsx';
import { Controls } from '@/ui/Controls.jsx';
import '@/ui/interaction/sessionBinding.js';

import { WorkspaceRegistry } from '@/workspaces/registry';

/**
 * The authoritative editor surface for a workspace mode.
 * This mounts the full editor stack and gates panels by capability.
 */
export function WorkspaceShell({ workspace }) {
    const router = useRouter();
    const pathname = usePathname();

    const capabilities = workspace.capabilities || {};

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            {/* ===== Header / Mode Bar ===== */}
            <header
                style={{
                    padding: '8px 12px',
                    borderBottom: '1px solid #e5e7eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                    background: '#f8fafc',
                }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <strong style={{ fontSize: 14 }}>{workspace.label}</strong>

                    {/* Mode Switcher */}
                    <select
                        value={workspace.key}
                        onChange={(e) => router.push(`/workspace/${e.target.value}`)}
                        style={{
                            fontSize: 12,
                            padding: '4px 6px',
                            borderRadius: 4,
                            border: '1px solid #d1d5db',
                            background: '#fff',
                        }}>
                        {Object.entries(WorkspaceRegistry).map(([key, ws]) => (
                            <option key={key} value={key}>
                                {ws.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Optional workspace nav (if defined) */}
                {workspace.routes && (
                    <nav style={{ display: 'flex', gap: 6 }}>
                        {Object.entries(workspace.routes).map(([routeKey, route]) => (
                            <a
                                key={routeKey}
                                href={route.href}
                                style={{
                                    padding: '4px 8px',
                                    borderRadius: 4,
                                    background: 'rgba(59,130,246,0.1)',
                                    color: '#2563eb',
                                    textDecoration: 'none',
                                    fontSize: 12,
                                }}>
                                {route.label}
                            </a>
                        ))}
                    </nav>
                )}
            </header>

            {/* ===== Main Editor Area ===== */}
            <div style={{ display: 'flex', flex: 1, position: 'relative' }}>
                {/* Left sidebar (layers, etc.) */}
                {capabilities.layers && (
                    <aside
                        style={{
                            width: 240,
                            borderRight: '1px solid #e5e7eb',
                            background: '#ffffff',
                        }}>
                        {/* Layers panel placeholder */}
                    </aside>
                )}

                {/* Canvas */}
                <main style={{ flex: 1, position: 'relative' }}>
                    <CanvasRoot />
                    <Controls profile={workspace.profile} />
                </main>

                {/* Right sidebar (properties) */}
                {capabilities.properties && (
                    <aside
                        style={{
                            width: 300,
                            borderLeft: '1px solid #e5e7eb',
                            background: '#ffffff',
                        }}>
                        {/* Properties panel placeholder */}
                    </aside>
                )}
            </div>

            {/* ===== Timeline ===== */}
            {capabilities.timeline && (
                <footer
                    style={{
                        height: 180,
                        borderTop: '1px solid #e5e7eb',
                        background: '#f8fafc',
                    }}>
                    {/* Timeline panel placeholder */}
                </footer>
            )}
        </div>
    );
}
