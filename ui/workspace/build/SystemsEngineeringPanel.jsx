'use client';

import { useWorkspaceProjectionState } from '@/runtime/projection';
import { buildProjectUniverseProjection } from '@/runtime/workspaces/projectUniverseProjection.js';
import { buildSystemsEngineeringOverlayModel } from '@/runtime/workspaces/buildOverlayWorkflow.js';

export function SystemsEngineeringPanel() {
    const document = useWorkspaceProjectionState((state) => state?.document ?? null);
    const universe = buildProjectUniverseProjection({ document });
    const model = buildSystemsEngineeringOverlayModel({ document, universe });

    return (
        <section
            aria-label="Systems Engineering"
            data-testid="systems-engineering-panel"
            style={{
                border: '1px solid rgba(148, 163, 184, 0.24)',
                borderRadius: 10,
                padding: 12,
                background: 'rgba(15, 23, 42, 0.72)',
                color: '#e2e8f0',
                fontSize: 12,
                lineHeight: 1.45,
            }}
        >
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Systems Engineering</div>
            <div style={{ marginBottom: 8 }}>Canonical build overlay for architecture graph, control logic, dataflow, and simulation.</div>
            <div style={{ display: 'grid', gap: 6 }}>
                <div>Architecture graphs: <strong>{model.graphCount}</strong></div>
                <div>Control models: <strong>{model.controlCount}</strong></div>
                <div>Dataflow signals: <strong>{model.dataflowCount}</strong></div>
                <div>
                    Simulation: <strong>{model.simulation.springChainCount}</strong> chains / <strong>{model.simulation.groupCount}</strong> groups / <strong>{model.simulation.profileCount}</strong> profiles
                </div>
            </div>
            <div style={{ marginTop: 10, display: 'grid', gap: 6 }}>
                <a
                    href={model.suggestedHref}
                    style={{ color: '#f8fafc', fontSize: 11, textDecoration: 'none', border: '1px solid rgba(226,232,240,0.24)', borderRadius: 8, padding: '6px 8px' }}
                >
                    Continue in Systems Engineering
                </a>
                {model.workflowNodes.slice(0, 2).map((item) => (
                    <a
                        key={item.id}
                        href={item.href}
                        style={{ color: '#cbd5e1', fontSize: 11, textDecoration: 'none' }}
                    >
                        {item.label} · {item.kind}
                    </a>
                ))}
                {model.systemNodes.slice(0, 1).map((item) => (
                    <a
                        key={item.id}
                        href={item.href}
                        style={{ color: '#cbd5e1', fontSize: 11, textDecoration: 'none' }}
                    >
                        {item.label} · {item.kind}
                    </a>
                ))}
            </div>
        </section>
    );
}

export default SystemsEngineeringPanel;
