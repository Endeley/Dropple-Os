'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useWorkspaceProjectionState } from '@/runtime/projection';
import { buildProjectUniverseProjection } from '@/runtime/workspaces/projectUniverseProjection.js';
import { buildEnterpriseOperationsOverlayModel } from '@/runtime/workspaces/buildOverlayWorkflow.js';
import {
    buildProjectArtifactContinuityHref,
    buildProjectWorldSessionBridgeKey,
    resolveProjectCameraFromSearchParams,
} from '@/runtime/workspaces/projectViewRouteState.js';

export function EnterpriseOperationsPanel() {
    const document = useWorkspaceProjectionState((state) => state?.document ?? null);
    const universe = buildProjectUniverseProjection({ document });
    const model = buildEnterpriseOperationsOverlayModel({ document, universe });
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const camera = resolveProjectCameraFromSearchParams(searchParams);
    const query = searchParams?.get('uq') ?? '';
    const currentEntryId =
        searchParams?.get('entry') ??
        (pathname?.endsWith('/enterprise-operations') ? 'enterprise-operations' : 'enterprise-operations');

    function buildContinuityTarget(item) {
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

    function writeContinuityEnvelope(target) {
        if (typeof window === 'undefined' || !window.sessionStorage || !target?.href || !target?.envelope) return;
        try {
            window.sessionStorage.setItem(
                buildProjectWorldSessionBridgeKey({ href: target.href }),
                JSON.stringify(target.envelope),
            );
        } catch {
            // fail-closed: route still navigates with durable intent
        }
    }

    return (
        <section
            aria-label="Enterprise Operations"
            data-testid="enterprise-operations-panel"
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
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Enterprise Operations</div>
            <div style={{ marginBottom: 8 }}>Canonical build overlay for process modeling, automation orchestration, and operational data flow.</div>
            <div style={{ display: 'grid', gap: 6 }}>
                <div>Processes: <strong>{model.processCount}</strong></div>
                <div>Automation paths: <strong>{model.automationCount}</strong></div>
                <div>Data sources: <strong>{model.datasourceCount}</strong></div>
                <div>Roles: <strong>{model.roleCount}</strong></div>
            </div>
            <div style={{ marginTop: 10, display: 'grid', gap: 6 }}>
                {(() => {
                    const target = buildContinuityTarget({
                        id: model.processNodes[0]?.id ?? null,
                        label: model.processNodes[0]?.label ?? 'Enterprise Operations',
                        kind: model.processNodes[0]?.kind ?? 'workflow',
                        href: model.suggestedHref,
                    });
                    return (
                        <Link
                            href={target.href}
                            onClick={() => writeContinuityEnvelope(target)}
                            style={{ color: '#f8fafc', fontSize: 11, textDecoration: 'none', border: '1px solid rgba(226,232,240,0.24)', borderRadius: 8, padding: '6px 8px' }}
                        >
                            Continue in Enterprise Operations
                        </Link>
                    );
                })()}
                {model.processNodes.slice(0, 3).map((item) => {
                    const target = buildContinuityTarget(item);
                    return (
                    <Link
                        key={item.id}
                        href={target.href}
                        onClick={() => writeContinuityEnvelope(target)}
                        style={{ color: '#cbd5e1', fontSize: 11, textDecoration: 'none' }}
                    >
                        {item.label} · {item.kind}
                    </Link>
                )})}
            </div>
        </section>
    );
}

export default EnterpriseOperationsPanel;
