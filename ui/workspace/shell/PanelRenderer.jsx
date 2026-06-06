'use client';

import { useEffect, useMemo, useState } from 'react';

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

const TAB_DEFINITIONS = Object.freeze([
    Object.freeze({ id: 'inspect', label: 'Inspect' }),
    Object.freeze({ id: 'surface', label: 'Surface' }),
    Object.freeze({ id: 'library', label: 'Library' }),
]);

function resolvePanelTab(panelId) {
    if (
        panelId === 'CanvasSurfacePanel' ||
        panelId === 'UXValidationPanel' ||
        panelId === 'UXSuggestionsPanel' ||
        panelId === 'UXRiskImpactPanel' ||
        panelId === 'UXEventListPanel'
    ) {
        return 'surface';
    }

    if (panelId === 'CertifiedTemplatesPanel') {
        return 'library';
    }

    return 'inspect';
}

function resolveInspectSections({ panelIds = [], extras = [] }) {
    const selection = panelIds.filter((panelId) =>
        ['NodeHeaderPanel', 'LayoutInspector', 'AutoLayoutPanel', 'ContentPanel', 'SemanticsPanel'].includes(panelId),
    );
    const motion = panelIds.filter((panelId) => ['MotionPanel', 'ExportPreviewPanel'].includes(panelId));

    if (extras.length > 0) {
        motion.push('__extras__');
    }

    return [
        Object.freeze({ id: 'selection', title: 'Selection', panelIds: selection }),
        Object.freeze({ id: 'motion', title: 'Motion & Export', panelIds: motion }),
    ].filter((section) => section.panelIds.length > 0);
}

function resolveSurfaceSections(panelIds = []) {
    const canvas = panelIds.filter((panelId) => panelId === 'CanvasSurfacePanel');
    const guidance = panelIds.filter((panelId) =>
        ['UXValidationPanel', 'UXSuggestionsPanel', 'UXRiskImpactPanel', 'UXEventListPanel'].includes(panelId),
    );

    return [
        Object.freeze({ id: 'canvas', title: 'Canvas Surface', panelIds: canvas }),
        Object.freeze({ id: 'guidance', title: 'Signals', panelIds: guidance }),
    ].filter((section) => section.panelIds.length > 0);
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
    const normalizedPanels = useMemo(
        () =>
            panels.filter((panelId) => {
                const entry = PanelRegistry[panelId];

                if (entry?.component) {
                    return true;
                }

                if (process.env.NODE_ENV !== 'production') {
                    console.warn(`[PanelRenderer] Unknown panel "${panelId}" in workspace activation`);
                }

                return false;
            }),
        [panels],
    );

    const tabs = useMemo(() => {
        const available = new Set();

        normalizedPanels.forEach((panelId) => available.add(resolvePanelTab(panelId)));
        if (extras.length > 0) {
            available.add('inspect');
        }

        return TAB_DEFINITIONS.filter((tab) => available.has(tab.id));
    }, [normalizedPanels, extras]);

    const [activeTab, setActiveTab] = useState(() => tabs[0]?.id ?? 'inspect');

    useEffect(() => {
        if (!tabs.some((tab) => tab.id === activeTab)) {
            setActiveTab(tabs[0]?.id ?? 'inspect');
        }
    }, [activeTab, tabs]);

    const inspectSections = useMemo(
        () => resolveInspectSections({ panelIds: normalizedPanels.filter((panelId) => resolvePanelTab(panelId) === 'inspect'), extras }),
        [normalizedPanels, extras],
    );
    const surfaceSections = useMemo(
        () => resolveSurfaceSections(normalizedPanels.filter((panelId) => resolvePanelTab(panelId) === 'surface')),
        [normalizedPanels],
    );
    const libraryPanels = useMemo(
        () => normalizedPanels.filter((panelId) => resolvePanelTab(panelId) === 'library'),
        [normalizedPanels],
    );

    function renderPanel(panelId) {
        const entry = PanelRegistry[panelId];
        if (!entry?.component) return null;

        const PanelComponent = entry.component;
        return (
            <div className='inspector-panel-card' key={panelId}>
                <PanelComponent node={node} emit={emit} />
            </div>
        );
    }

    return (
        <aside className='uiux-rightpanel'>
            <div className='inspector-shell'>
                <div className='inspector-header'>
                    <div className='inspector-title'>Inspector</div>

                    <div className='inspector-subtitle'>{node?.name || node?.type || 'No Selection'}</div>
                </div>

                {tabs.length > 1 ? (
                    <div className='panel-tabs' role='tablist' aria-label='Inspector views'>
                        {tabs.map((tab) => {
                            const active = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    type='button'
                                    role='tab'
                                    aria-selected={active}
                                    data-testid={`inspector-tab-${tab.id}`}
                                    className={active ? 'active' : undefined}
                                    onClick={() => setActiveTab(tab.id)}>
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                ) : null}

                <div className='panel-content'>
                    {activeTab === 'inspect'
                        ? inspectSections.map((section) => (
                              <PanelSection key={section.id} title={section.title}>
                                  {section.panelIds.map((panelId) => {
                                      if (panelId === '__extras__') {
                                          return extras.map((panel) => {
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
                                          });
                                      }

                                      return renderPanel(panelId);
                                  })}
                              </PanelSection>
                          ))
                        : null}

                    {activeTab === 'surface'
                        ? surfaceSections.map((section) => (
                              <PanelSection key={section.id} title={section.title}>
                                  {section.panelIds.map((panelId) => renderPanel(panelId))}
                              </PanelSection>
                          ))
                        : null}

                    {activeTab === 'library' && libraryPanels.length > 0 ? (
                        <PanelSection title='Blueprint Library'>
                            {libraryPanels.map((panelId) => renderPanel(panelId))}
                        </PanelSection>
                    ) : null}
                </div>
            </div>
        </aside>
    );
}
