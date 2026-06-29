'use client';

import { getUIUXLanguageDefinition } from './uiuxLanguageDictionary.js';
import { getUIUXScenarioSourceLabel } from './uiuxScenarioProvision.js';

function Chip({ children }) {
    return (
        <span
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '4px 8px',
                borderRadius: 999,
                background: '#eef2ff',
                color: '#3730a3',
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.01em',
            }}>
            {children}
        </span>
    );
}

function Section({ title, children }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div
                style={{
                    fontSize: 11,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: '#64748b',
                    fontWeight: 700,
                }}>
                {title}
            </div>
            {children}
        </div>
    );
}

export function UIUXLanguageProjectionPanel({
    node,
    scenarioProvision = null,
    scenarioOptions = [],
    onScenarioChange = null,
}) {
    if (!node) return null;

    const resolvedScenario = scenarioProvision?.scenario ?? null;
    const scenarioSource = scenarioProvision?.source ?? 'default';
    const definition = getUIUXLanguageDefinition(node.type, { scenario: resolvedScenario, node });
    if (!definition) return null;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Section title='Identity'>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <strong style={{ fontSize: 14, color: '#0f172a' }}>
                        {definition.identity || definition.concept}
                    </strong>
                    <span style={{ fontSize: 12, color: '#475569', lineHeight: 1.5 }}>
                        This is a {definition.identity || definition.concept}.
                    </span>
                    <span style={{ fontSize: 12, color: '#475569', lineHeight: 1.5 }}>
                        {definition.identitySummary}
                    </span>
                </div>
            </Section>

            {definition.meaning ? (
                <Section title='Meaning'>
                    <div style={{ fontSize: 12, color: '#334155', lineHeight: 1.5 }}>{definition.meaning}</div>
                </Section>
            ) : null}

            {node.type === 'frame' ? (
                <Section title='Scenario'>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <div style={{ fontSize: 12, color: '#334155', lineHeight: 1.5 }}>
                            Creative Scenario is declared, not inferred.
                        </div>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Current scenario</span>
                            <select
                                value={resolvedScenario ?? ''}
                                onChange={(event) => onScenarioChange?.(event.target.value || null)}
                                style={{
                                    border: '1px solid #cbd5e1',
                                    borderRadius: 8,
                                    padding: '8px 10px',
                                    background: '#fff',
                                    color: '#0f172a',
                                    fontSize: 12,
                                }}>
                                <option value=''>Auto</option>
                                {(Array.isArray(scenarioOptions) ? scenarioOptions : []).map((option) => (
                                    <option key={option.id} value={option.id}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <div style={{ fontSize: 11, color: '#64748b' }}>
                            Source: {getUIUXScenarioSourceLabel(scenarioSource)}
                        </div>
                    </div>
                </Section>
            ) : null}

            {Array.isArray(definition.evolvesInto) && definition.evolvesInto.length > 0 ? (
                <Section title='Evolution'>
                    <div style={{ fontSize: 12, color: '#334155' }}>{definition.projection?.prompt || 'This can become:'}</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {definition.evolvesInto.map((entry) => (
                            <Chip key={entry}>{entry}</Chip>
                        ))}
                    </div>
                </Section>
            ) : null}

            {Array.isArray(definition.nextMeaningfulSteps) && definition.nextMeaningfulSteps.length > 0 ? (
                <Section title='Next Meaningful Steps'>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {definition.nextMeaningfulSteps.map((entry) => (
                            <div
                                key={entry}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    fontSize: 12,
                                    color: '#334155',
                                }}>
                                <span style={{ color: '#6366f1', fontWeight: 700 }}>•</span>
                                <span>{entry}</span>
                            </div>
                        ))}
                    </div>
                </Section>
            ) : null}

            {Array.isArray(definition.capabilityDomains) && definition.capabilityDomains.length > 0 ? (
                <Section title='Capabilities'>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {definition.capabilityDomains.map((entry) => (
                            <Chip key={entry}>{entry}</Chip>
                        ))}
                    </div>
                </Section>
            ) : null}
        </div>
    );
}

export default UIUXLanguageProjectionPanel;
