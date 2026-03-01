import fs from 'fs';
import path from 'path';
import { validateSemVer, compareVersions } from './TemplateVersioning.js';
import { verifyTemplateCertification } from './TemplateCertification.js';
import { computeRegistryFingerprint } from './TemplateRegistryIntegrity.js';

const REGISTRY_PATH = path.join(process.cwd(), '.registry', 'certifiedTemplates.json');

function loadRegistry() {
  if (!fs.existsSync(REGISTRY_PATH)) {
    return [];
  }

  const raw = fs.readFileSync(REGISTRY_PATH, 'utf-8');
  return JSON.parse(raw);
}

function saveRegistry(entries) {
  const frozen = Object.freeze(entries);
  const dir = path.dirname(REGISTRY_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(REGISTRY_PATH, JSON.stringify(frozen, null, 2));
}

function ensureAppendOnly(existingEntries, newEntry) {
  const exists = existingEntries.find(
    (e) => e.id === newEntry.id && e.version === newEntry.version
  );

  if (exists) {
    throw new Error(
      `Template ${newEntry.id}@${newEntry.version} already exists in registry.`
    );
  }
}

function enforceVersionProgression(existingEntries, newEntry) {
  const versions = existingEntries
    .filter((e) => e.id === newEntry.id)
    .map((e) => e.version);

  if (versions.length === 0) return;

  const highest = versions.sort(compareVersions).pop();

  if (compareVersions(newEntry.version, highest) <= 0) {
    throw new Error(
      `Version must be greater than existing highest version (${highest}).`
    );
  }
}

export function registerTemplate({ template, engineVersion, publicKey }) {
  const registry = loadRegistry();

  // 1. Verify certification first
  const verification = verifyTemplateCertification({
    template,
    engineVersion,
    publicKey,
  });

  if (!verification.valid) {
    throw new Error(`Certification invalid: ${verification.reason}`);
  }

  // 2. Validate version
  validateSemVer(template.version);

  // 3. Enforce append-only
  ensureAppendOnly(registry, template);

  // 4. Enforce version progression
  enforceVersionProgression(registry, template);

  // 5. Append
  const updated = [...registry, template];

  // 6. Save
  saveRegistry(updated);

  return {
    registered: true,
    fingerprint: computeRegistryFingerprint(updated),
  };
}
