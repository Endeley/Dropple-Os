import fs from 'fs';
import path from 'path';
import { validateSemVer, compareVersions } from './TemplateVersioning.js';
import { verifyTemplateCertification } from './TemplateCertification.js';
import { computeRegistryFingerprint } from './TemplateRegistryIntegrity.js';

function getRegistryPath() {
    return path.join(process.cwd(), '.registry', 'certifiedTemplates.json');
}

export function loadRegistry() {
    const registryPath = getRegistryPath();
    if (!fs.existsSync(registryPath)) {
        return [];
    }

    const raw = fs.readFileSync(registryPath, 'utf-8');
    return JSON.parse(raw);
}

function saveRegistry(entries) {
    const registryPath = getRegistryPath();
    const dir = path.dirname(registryPath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(registryPath, JSON.stringify(entries, null, 2));
}

function resolveTemplateEntry({ template, seed }) {
    return seed ?? template ?? null;
}

function assertTemplateIdentity(template) {
    if (!template || typeof template !== 'object') {
        throw new Error('Template registry entry must be an object.');
    }
    if (typeof template.id !== 'string' || template.id.length === 0) {
        throw new Error('Template id is required.');
    }
    if (typeof template.version !== 'string' || template.version.length === 0) {
        throw new Error('Template version is required.');
    }
}

function ensureAppendOnly(existingEntries, newEntry) {
    const exists = existingEntries.find(
        (entry) => entry.id === newEntry.id && entry.version === newEntry.version,
    );

    if (exists) {
        throw new Error(
            `Template ${newEntry.id}@${newEntry.version} already exists in registry.`,
        );
    }
}

function enforceVersionProgression(existingEntries, newEntry) {
    const versions = existingEntries
        .filter((entry) => entry.id === newEntry.id)
        .map((entry) => entry.version);

    if (versions.length === 0) return;

    const highest = versions.sort(compareVersions).pop();

    if (compareVersions(newEntry.version, highest) <= 0) {
        throw new Error(
            `Version must be greater than existing highest version (${highest}).`,
        );
    }
}

export function registerTemplate({
    template,
    seed,
    engineVersion,
    publicKey,
}) {
    const entry = resolveTemplateEntry({ template, seed });
    assertTemplateIdentity(entry);

    const registry = loadRegistry();
    const verification = verifyTemplateCertification({
        template: entry,
        engineVersion,
        publicKey,
    });

    if (!verification.valid) {
        throw new Error(`Certification invalid: ${verification.reason}`);
    }

    validateSemVer(entry.version);
    ensureAppendOnly(registry, entry);
    enforceVersionProgression(registry, entry);

    const updated = [...registry, entry];
    saveRegistry(updated);

    return {
        registered: true,
        fingerprint: computeRegistryFingerprint(updated),
        size: updated.length,
    };
}
