'use client';

import { useEffect, useMemo, useState } from 'react';

import { PanelRegistry } from '@/ui/panels/PanelRegistry';
import { getWorkspaceActivation } from '@/ui/bridges/workspaceActivationFacade.js';
import { useWorkspaceProjectionState } from '@/runtime/projection';
import { getMotionClipsForNode } from '@/ui/motion/motionClipActions.js';
import { resolveInspectSections } from './panelComposition.js';

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

export function PanelRenderer({ workspaceId, node, emit, extraPanels = [], panelPropsById = null }) {
    const activation = getWorkspaceActivation(workspaceId);
    const document = useWorkspaceProjectionState((state) => state.document ?? null);
    const panels = Array.isArray(activation?.panels) ? activation.panels : [];
    const extras = Array.isArray(extraPanels) ? extraPanels : [];
    const attachedMotionCount = useMemo(() => getMotionClipsForNode(document, node?.id ?? null).length, [document, node?.id]);
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
        () =>
            resolveInspectSections({
                panelIds: normalizedPanels.filter((panelId) => resolvePanelTab(panelId) === 'inspect'),
                extras,
                node,
                workspaceId,
                hasAttachedMotion: attachedMotionCount > 0,
            }),
        [normalizedPanels, extras, node, workspaceId, attachedMotionCount],
    );
    const surfaceSections = useMemo(
        () => resolveSurfaceSections(normalizedPanels.filter((panelId) => resolvePanelTab(panelId) === 'surface')),
        [normalizedPanels],
    );
    const libraryPanels = useMemo(
        () => normalizedPanels.filter((panelId) => resolvePanelTab(panelId) === 'library'),
        [normalizedPanels],
    );
    const inspectorSurfaceState = node ? 'focused' : activeTab === 'library' ? 'library' : activeTab === 'surface' ? 'surface' : 'idle';
    const inspectorSurfaceSource = node ? 'selection' : activeTab === 'library' ? 'library' : activeTab === 'surface' ? 'canvas' : 'context';
    const inspectorContextVisibility = node ? 'expanded' : activeTab === 'inspect' ? 'minimal' : 'supporting';

    useEffect(() => {
        if (activation || process.env.NODE_ENV === 'production') return;
        console.warn(`[PanelRenderer] No workspace activation found for "${workspaceId}"`);
    }, [activation, workspaceId]);

    function renderPanel(panelId) {
        const entry = PanelRegistry[panelId];
        if (!entry?.component) return null;

        const PanelComponent = entry.component;
        const extraProps =
            panelPropsById && typeof panelPropsById === 'object' && !Array.isArray(panelPropsById)
                ? panelPropsById[panelId] ?? null
                : null;
        return (
            <div className='inspector-panel-card' key={panelId}>
                <PanelComponent node={node} emit={emit} {...(extraProps ?? {})} />
            </div>
        );
    }

    if (!activation) {
        return null;
    }

    return (
        <aside className='uiux-rightpanel'>
            <div
                className='inspector-shell'
                data-testid='inspector-shell'
                data-state={inspectorSurfaceState}
                data-emergence-source={inspectorSurfaceSource}
                data-context-visibility={inspectorContextVisibility}
                data-motion-meaning='focus'>
                <div className='inspector-header'>
                    <div className='inspector-header-main'>
                        <div className='inspector-title'>Inspector</div>
                        <div className='inspector-subtitle'>{node?.name || node?.type || 'No Selection'}</div>
                    </div>
                </div>
                <div
                    data-testid='inspector-context-summary'
                    style={{
                        padding: '0 12px 10px',
                        fontSize: 10,
                        color: '#64748b',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                    }}>
                    {inspectorSurfaceState === 'focused'
                        ? 'Context: selection'
                        : inspectorSurfaceState === 'surface'
                          ? 'Context: canvas surface'
                          : inspectorSurfaceState === 'library'
                            ? 'Context: blueprint library'
                            : 'Context: waiting for selection'}
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
                        ? inspectSections.length > 0 ? (
                              inspectSections.map((section) => (
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
                          ) : (
                              <div className='inspector-empty-state' data-testid='inspector-empty-state'>
                                  <strong>No active selection</strong>
                                  <span>Choose a node to inspect structure, layout, and motion-aware properties.</span>
                              </div>
                          )
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
