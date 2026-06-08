'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useWorkspaceProjectionState } from '@/runtime/projection';
import { buildProjectUniverseProjection } from '@/runtime/workspaces/projectUniverseProjection.js';
import { buildSystemsEngineeringOverlayModel } from '@/runtime/workspaces/buildOverlayWorkflow.js';
import {
    buildProjectArtifactContinuityHref,
    resolveProjectCameraFromSearchParams,
} from '@/runtime/workspaces/projectViewRouteState.js';

export function SystemsEngineeringPanel() {
    const document = useWorkspaceProjectionState((state) => state?.document ?? null);
    const universe = buildProjectUniverseProjection({ document });
    const model = buildSystemsEngineeringOverlayModel({ document, universe });
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const camera = resolveProjectCameraFromSearchParams(searchParams);
    const query = searchParams?.get('uq') ?? '';
    const currentEntryId =
        searchParams?.get('entry') ??
        (pathname?.endsWith('/systems-engineering') ? 'systems-engineering' : 'systems-engineering');

    function buildContinuityHref(item) {
        return buildProjectArtifactContinuityHref({
            href: item?.href,
            camera,
            query,
            currentPerspectiveId: 'operate',
            currentEntryId,
            continuityTarget: Object.freeze({
                targetId: item?.id,
                label: item?.label,
                kind: item?.kind,
            }),
        });
    }

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
                <Link
                    href={buildContinuityHref({
                        id: model.workflowNodes[0]?.id ?? model.systemNodes[0]?.id ?? null,
                        label: model.workflowNodes[0]?.label ?? model.systemNodes[0]?.label ?? 'Systems Engineering',
                        kind: model.workflowNodes[0]?.kind ?? model.systemNodes[0]?.kind ?? 'workflow',
                        href: model.suggestedHref,
                    })}
                    style={{ color: '#f8fafc', fontSize: 11, textDecoration: 'none', border: '1px solid rgba(226,232,240,0.24)', borderRadius: 8, padding: '6px 8px' }}
                >
                    Continue in Systems Engineering
                </Link>
                {model.workflowNodes.slice(0, 2).map((item) => (
                    <Link
                        key={item.id}
                        href={buildContinuityHref(item)}
                        style={{ color: '#cbd5e1', fontSize: 11, textDecoration: 'none' }}
                    >
                        {item.label} · {item.kind}
                    </Link>
                ))}
                {model.systemNodes.slice(0, 1).map((item) => (
                    <Link
                        key={item.id}
                        href={buildContinuityHref(item)}
                        style={{ color: '#cbd5e1', fontSize: 11, textDecoration: 'none' }}
                    >
                        {item.label} · {item.kind}
                    </Link>
                ))}
            </div>
        </section>
    );
}

export default SystemsEngineeringPanel;
