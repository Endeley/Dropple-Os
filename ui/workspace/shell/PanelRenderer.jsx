'use client';

import { PanelRegistry } from '@/ui/panels/PanelRegistry';
import { getWorkspaceActivation } from '@/ui/bridges/workspaceActivationFacade.js';

function PanelSection({ title, children }) {
    return (
        <section className='inspector-section'>
            <div className='inspector-section-header'>
                <span>{title}</span>
            </div>

            <div className='inspector-section-body'>{children}</div>
        </section>
    );
}

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
        <aside className='uiux-rightpanel'>
            <div className='inspector-shell'>
                <div className='inspector-header'>
                    <div className='inspector-title'>Inspector</div>

                    <div className='inspector-subtitle'>{node?.name || node?.type || 'No Selection'}</div>
                </div>

                <div className='panel-content'>
                    <PanelSection title='Properties'>
                        {panels.map((panelId) => {
                            const entry = PanelRegistry[panelId];

                            if (!entry?.component) {
                                if (process.env.NODE_ENV !== 'production') {
                                    console.warn(`[PanelRenderer] Unknown panel "${panelId}" in workspace activation`);
                                }
                                return null;
                            }

                            const PanelComponent = entry.component;

                            return (
                                <div className='inspector-panel-card' key={panelId}>
                                    <PanelComponent node={node} emit={emit} />
                                </div>
                            );
                        })}
                    </PanelSection>

                    {extras.length > 0 && (
                        <PanelSection title='Workspace'>
                            {extras.map((panel) => {
                                if (!panel?.component) {
                                    if (process.env.NODE_ENV !== 'production') {
                                        console.warn('[PanelRenderer] Invalid extra panel configuration', panel);
                                    }
                                    return null;
                                }

                                const ExtraPanel = panel.component;

                                return (
                                    <div className='inspector-panel-card' key={panel.key || panel.id}>
                                        <ExtraPanel {...(panel.props || {})} />
                                    </div>
                                );
                            })}
                        </PanelSection>
                    )}
                </div>
            </div>
        </aside>
    );
}
