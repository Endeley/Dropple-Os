import fs from 'node:fs';
import path from 'node:path';
import { hashRuntimeState } from '../core/persistence/hashDocument.js';

function readJson(filePath) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, value) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

export function buildFederationAuditLineage({
    reportPath = '.artifacts/release-trust.json',
    outputPath = '.artifacts/federation-audit-lineage.json',
    nowIso = new Date().toISOString(),
} = {}) {
    const report = readJson(reportPath);
    const federationAttestation = report?.checks?.federationAttestation ?? {};
    const federationLifecycle = report?.checks?.federationLifecycle ?? {};

    const payload = Object.freeze({
        schemaVersion: '1.0.0',
        generatedAt: nowIso,
        reportHash: String(report?.reportHash ?? ''),
        federationAuditHash: String(federationAttestation?.hash ?? ''),
        federationAuditEntryCount: Number.isFinite(federationAttestation?.entryCount)
            ? Number(federationAttestation.entryCount)
            : 0,
        tamperRejected: federationAttestation?.tamperRejected === true,
        replayEquivalent: federationLifecycle?.replayEquivalent === true,
        staleRejected: federationLifecycle?.staleRejected === true,
        orderingClosed: federationLifecycle?.orderingClosed === true,
    });

    const lineage = Object.freeze({
        ...payload,
        lineageHash: hashRuntimeState(payload),
    });

    writeJson(outputPath, lineage);
    return lineage;
}

if (process.argv[1] && process.argv[1].endsWith('federationAuditLineageReport.mjs')) {
    const lineage = buildFederationAuditLineage({
        reportPath: process.env.RELEASE_TRUST_REPORT_PATH || '.artifacts/release-trust.json',
        outputPath: process.env.FEDERATION_AUDIT_LINEAGE_PATH || '.artifacts/federation-audit-lineage.json',
    });
    if (
        lineage.tamperRejected !== true ||
        lineage.replayEquivalent !== true ||
        lineage.staleRejected !== true ||
        lineage.orderingClosed !== true
    ) {
        console.error('[FederationAuditLineage] FAIL');
        console.error(`[FederationAuditLineage] payload: ${JSON.stringify(lineage)}`);
        process.exit(1);
    }
    console.log('[FederationAuditLineage] OK');
    console.log(`[FederationAuditLineage] lineageHash: ${lineage.lineageHash}`);
}
