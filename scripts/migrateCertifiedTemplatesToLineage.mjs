import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { createRegistryEnvelope, REGISTRY_FORMAT, REGISTRY_VERSION } from '../domain/templates/TemplateRegistry.js';
import { computeRegistryFingerprint } from '../domain/templates/TemplateRegistryIntegrity.js';
import { registerTemplateCertification } from '../domain/templates/TemplateCertification.js';
import { createTemplateSeed } from '../engine/templates/templateSeed.js';
import { certifyTemplateSeed } from '../engine/templates/certifyTemplateSeed.js';
import { deriveTemplateSeedLineageNodeId } from '../domain/templates/TemplateSeedLineageGraph.js';

function stableSerialize(value) {
    if (Array.isArray(value)) {
        return value.map((item) => stableSerialize(item));
    }

    if (value && typeof value === 'object') {
        const result = {};
        for (const key of Object.keys(value).sort()) {
            result[key] = stableSerialize(value[key]);
        }
        return result;
    }

    return value;
}

function hashObject(value) {
    return crypto
        .createHash('sha256')
        .update(JSON.stringify(stableSerialize(value)))
        .digest('hex');
}

function getRegistryPath(cwd = process.cwd()) {
    return path.join(cwd, '.registry', 'certifiedTemplates.json');
}

function getBackupPath(cwd = process.cwd()) {
    return path.join(cwd, '.registry', 'certifiedTemplates.legacy.backup.json');
}

function isSeedTemplate(template) {
    return Boolean(
        template &&
            typeof template === 'object' &&
            template.baseSceneGraph &&
            template.states &&
            typeof template.defaultState === 'string',
    );
}

function readRegistryPayload(cwd = process.cwd()) {
    const registryPath = getRegistryPath(cwd);
    if (!fs.existsSync(registryPath)) {
        return null;
    }

    return JSON.parse(fs.readFileSync(registryPath, 'utf8'));
}

function writeRegistryPayload(payload, cwd = process.cwd()) {
    const registryPath = getRegistryPath(cwd);
    const dir = path.dirname(registryPath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(registryPath, JSON.stringify(payload, null, 2));
}

function ensureBackup(cwd, payload) {
    const backupPath = getBackupPath(cwd);
    if (fs.existsSync(backupPath)) {
        return backupPath;
    }

    fs.writeFileSync(backupPath, JSON.stringify(payload, null, 2));
    return backupPath;
}

function resolveEngineVersion(entry) {
    return (
        entry?.certification?.engineVersion ??
        entry?.metadata?.engine ??
        entry?.metadata?.compatibleEngineVersion ??
        'dropple-motion@1.x'
    );
}

function deriveLegacyLineageVersionId(entry) {
    const anchor =
        entry?.certification?.snapshotHash ??
        entry?.certification?.structuralHash ??
        entry?.snapshotHash ??
        entry?.structuralHash ??
        hashObject({
            id: entry?.id ?? null,
            version: entry?.version ?? null,
            certification: entry?.certification ?? null,
        });

    return deriveTemplateSeedLineageNodeId({
        type: 'seed',
        parentIds: [],
        contentHash: anchor,
    });
}

function migrateLegacySeedEntry(entry) {
    const normalizedSeed = createTemplateSeed({
        id: entry.id,
        version: entry.version,
        snapshotHash: entry.snapshotHash,
        baseSceneGraph: entry.baseSceneGraph,
        states: entry.states,
        defaultState: entry.defaultState,
        capabilityProfile: entry.capabilityProfile,
        metadata: entry.metadata,
        params: entry.params,
        contentHashInputs: entry.contentHashInputs,
        contentHash: entry.contentHash,
        lineage: entry.lineage,
    });

    const certifiedSeed = certifyTemplateSeed({
        ...normalizedSeed,
        mode: entry.mode ?? null,
    });
    const engineVersion = resolveEngineVersion(certifiedSeed);

    return {
        ...entry,
        ...certifiedSeed,
        certification: registerTemplateCertification({
            certification: certifiedSeed.certification,
            engineVersion,
        }),
        versionId: certifiedSeed.lineage.nodeId,
        lineageRootId: certifiedSeed.lineage.rootId,
        parentVersionIds: certifiedSeed.lineage.parentIds,
    };
}

function migrateLegacyGraphEntry(entry) {
    const engineVersion = resolveEngineVersion(entry);
    const versionId = deriveLegacyLineageVersionId(entry);
    const lineageRootId = versionId;
    const certification = registerTemplateCertification({
        certification: {
            ...(entry.certification ?? {}),
            lineageRootId,
            lineageNodeId: versionId,
            certificationHash: hashObject({
                structuralHash: entry?.certification?.structuralHash ?? null,
                snapshotHash: entry?.certification?.snapshotHash ?? null,
                signature: entry?.certification?.signature ?? null,
                engineVersion,
                lineageRootId,
                lineageNodeId: versionId,
            }),
        },
        engineVersion,
    });

    return {
        ...entry,
        versionId,
        lineageRootId,
        parentVersionIds: [],
        certification,
    };
}

export function migrateLegacyCertifiedEntries(entries = []) {
    return entries.map((entry) => (
        isSeedTemplate(entry) ? migrateLegacySeedEntry(entry) : migrateLegacyGraphEntry(entry)
    ));
}

export function migrateCertifiedTemplatesToLineage({ cwd = process.cwd(), write = true } = {}) {
    const payload = readRegistryPayload(cwd);
    if (!payload) {
        return {
            migrated: false,
            reason: 'missing-registry',
            path: getRegistryPath(cwd),
        };
    }

    if (
        payload &&
        typeof payload === 'object' &&
        payload.format === REGISTRY_FORMAT &&
        payload.version === REGISTRY_VERSION &&
        Array.isArray(payload.entries)
    ) {
        const fingerprint = computeRegistryFingerprint(payload);
        return {
            migrated: false,
            reason: 'already-v2',
            path: getRegistryPath(cwd),
            fingerprint,
            size: payload.entries.length,
        };
    }

    const legacyEntries = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.entries)
            ? payload.entries
            : null;

    if (!legacyEntries) {
        throw new Error('Legacy certified template registry is corrupted.');
    }

    const migratedEntries = migrateLegacyCertifiedEntries(legacyEntries);
    const envelope = createRegistryEnvelope(migratedEntries);
    const fingerprint = computeRegistryFingerprint(envelope);
    const backupPath = ensureBackup(cwd, payload);

    if (write) {
        writeRegistryPayload(envelope, cwd);
    }

    return {
        migrated: true,
        path: getRegistryPath(cwd),
        backupPath,
        fingerprint,
        size: envelope.entries.length,
        envelope,
    };
}

function isDirectRun() {
    if (!process.argv[1]) return false;
    return fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
}

if (isDirectRun()) {
    const result = migrateCertifiedTemplatesToLineage();

    if (result.migrated) {
        console.log('[TemplateRegistryMigration] Migrated certified template registry to lineage-aware v2.');
        console.log(`[TemplateRegistryMigration] Entries: ${result.size}`);
        console.log(`[TemplateRegistryMigration] Fingerprint: ${result.fingerprint}`);
        console.log(`[TemplateRegistryMigration] Backup: ${result.backupPath}`);
    } else {
        console.log(`[TemplateRegistryMigration] ${result.reason}`);
        if (result.fingerprint) {
            console.log(`[TemplateRegistryMigration] Fingerprint: ${result.fingerprint}`);
        }
    }
}
