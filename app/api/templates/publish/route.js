import fs from 'node:fs';
import { NextResponse } from 'next/server';
import { publishTemplateFromWorkspace } from '@/templates/publishTemplateFromWorkspace.js';
import { buildReleaseTrustSummary } from '@/scripts/releaseTrustSummary.mjs';

function maybeBuildReleaseTrustSurface() {
    const reportPath = process.env.RELEASE_TRUST_CURRENT_PATH || '.artifacts/release-trust.json';
    if (!fs.existsSync(reportPath)) {
        return Object.freeze({
            status: 'UNAVAILABLE',
            summary: '## Release Trust Diff Summary\n\n- Status: **UNAVAILABLE**\n- Reason: `release-trust-report-missing`\n',
        });
    }

    const summary = buildReleaseTrustSummary();
    const lines = String(summary)
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);
    const statusLine = lines.find((line) => line.startsWith('- Status:')) ?? null;
    const status = statusLine?.includes('PASS') ? 'PASS' : statusLine?.includes('FAIL') ? 'FAIL' : 'UNKNOWN';

    return Object.freeze({
        status,
        summary,
    });
}

export async function POST(request) {
    try {
        const payload = await request.json();
        const result = publishTemplateFromWorkspace(payload ?? {});
        return NextResponse.json({
            result,
            releaseTrust: maybeBuildReleaseTrustSurface(),
        });
    } catch (error) {
        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : 'Template publish failed.',
            },
            { status: 400 },
        );
    }
}
