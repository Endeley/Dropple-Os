'use client';

import { PanelRegistry } from '@/ui/panels/PanelRegistry';
import { getWorkspaceActivation } from '@/ui/bridges/workspaceActivationFacade.js';

export function PanelRenderer({ workspaceId, node, emit, extraPanels = [] }) {
    const activation = getWorkspaceActivation(workspaceId);

    if (!activation) {
        if (process.env.NODE_ENV !== 'production') {
            console.warn(`[PanelRenderer] No workspace activation found for "${workspaceId}"`);
        }
        return null;
    }

    const panels = Array.isArray(activation.panels) ? activation.panels : [];

    const extras = Array.isArray(extraPanels) ? extraPanels : [];

    return (
        <aside className='workspace-panel-stack'>
            <div className='panel-content'>
                {/* Canonical panels from workspace activation truth */}
                {panels.map((panelId) => {
                    const entry = PanelRegistry[panelId];

                    if (!entry?.component) {
                        if (process.env.NODE_ENV !== 'production') {
                            console.warn(`[PanelRenderer] Unknown panel "${panelId}" in workspace activation`);
                        }
                        return null;
                    }

                    const PanelComponent = entry.component;

                    return <PanelComponent key={panelId} node={node} emit={emit} />;
                })}

                {/* Optional additive overlay panels (templates, etc.) */}
                {extras.map((panel) => {
                    if (!panel?.component) {
                        if (process.env.NODE_ENV !== 'production') {
                            console.warn('[PanelRenderer] Invalid extra panel configuration', panel);
                        }
                        return null;
                    }

                    const ExtraPanel = panel.component;

                    return <ExtraPanel key={panel.key || panel.id} {...(panel.props || {})} />;
                })}
            </div>
        </aside>
    );
}
