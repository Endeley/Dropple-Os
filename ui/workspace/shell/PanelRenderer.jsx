'use client';

import { resolveWorkspacePolicy } from '@/workspaces/registry/resolveWorkspacePolicy';
import { PanelRegistry } from '@/ui/panels/PanelRegistry';

export function PanelRenderer({ workspaceId, node, emit, extraPanels = [] }) {
    const policy = resolveWorkspacePolicy(workspaceId);
    if (!policy || policy?.error) return null;

    const panels = Array.isArray(policy.panels) ? policy.panels : [];
    const extras = Array.isArray(extraPanels) ? extraPanels : [];

    return (
        <aside className="uiux-rightpanel">
            <div className="panel-content">
                {panels.map((panelId) => {
                    const entry = PanelRegistry[panelId];
                    if (!entry?.component) return null;
                    const PanelComponent = entry.component;
                    return (
                        <PanelComponent
                            key={panelId}
                            node={node}
                            emit={emit}
                        />
                    );
                })}
                {extras.map((panel) => {
                    if (!panel?.component) return null;
                    const ExtraPanel = panel.component;
                    return (
                        <ExtraPanel key={panel.key || panel.id} {...(panel.props || {})} />
                    );
                })}
            </div>
        </aside>
    );
}
