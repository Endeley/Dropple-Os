'use client';

import CertifiedTemplatePanel from '@/ui/registry/CertifiedTemplatePanel.jsx';
import { useCertifiedTemplates } from '@/ui/registry/useCertifiedTemplates.js';
import { RuntimeDispatchRelay } from '@/runtime/boundary/RuntimeDispatchRelay.jsx';

async function fetchCertifiedTemplates({ mode }) {
    const params = mode ? `?mode=${encodeURIComponent(mode)}` : '';
    const response = await fetch(`/api/templates/certified${params}`);
    if (!response.ok) {
        throw new Error('Failed to load certified templates.');
    }
    const payload = await response.json();
    return payload?.templates ?? [];
}

function CertifiedTemplatesPanelContent({ mode = 'uiux', dispatcher = null }) {
    const { templates, install, loading, error } = useCertifiedTemplates({
        mode,
        loadCertifiedTemplates: fetchCertifiedTemplates,
        dispatcher,
    });

    if (loading) {
        return (
            <div style={{ padding: 16, color: '#94a3b8' }}>Loading templates...</div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: 16, color: '#b45309' }}>
                Failed to load templates.
            </div>
        );
    }

    return (
        <CertifiedTemplatePanel templates={templates} onInstall={install} />
    );
}

export function CertifiedTemplatesPanel({ mode = 'uiux' }) {
    return (
        <RuntimeDispatchRelay>
            {(dispatcher) => <CertifiedTemplatesPanelContent mode={mode} dispatcher={dispatcher} />}
        </RuntimeDispatchRelay>
    );
}
