import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { verifyTemplateCertification } from '../domain/templates/TemplateCertification.js';
import { computeRegistryFingerprint } from '../domain/templates/TemplateRegistryIntegrity.js';

dotenv.config({
    path: path.join(process.cwd(), '.env.local'),
}); // Load .env.local

console.log('ENGINE_VERSION:', process.env.ENGINE_VERSION);
console.log('PUBLIC_KEY_LENGTH:', process.env.ROOT_PUBLIC_KEY?.length);

const REGISTRY_PATH = path.join(process.cwd(), '.registry', 'certifiedTemplates.json');
const LOCAL_PUBLIC_KEY_PATH = path.join(process.cwd(), 'keys', 'public.pem');

if (!fs.existsSync(REGISTRY_PATH)) {
    console.log('[TemplateVerifyAll] No registry found. Skipping.');
    process.exit(0);
}

const raw = fs.readFileSync(REGISTRY_PATH, 'utf-8');
const templates = JSON.parse(raw);

if (!Array.isArray(templates)) {
    console.error('[TemplateVerifyAll] Registry corrupted.');
    process.exit(1);
}

const engineVersion = process.env.ENGINE_VERSION;

// Prefer env key (CI), fallback to local file (dev)
let publicKey = process.env.ROOT_PUBLIC_KEY;

if (!publicKey && fs.existsSync(LOCAL_PUBLIC_KEY_PATH)) {
    publicKey = fs.readFileSync(LOCAL_PUBLIC_KEY_PATH, 'utf-8');
}

if (!engineVersion || !publicKey) {
    console.error('[TemplateVerifyAll] Missing ENGINE_VERSION or ROOT_PUBLIC_KEY');
    process.exit(1);
}

let failures = 0;

for (const template of templates) {
    const result = verifyTemplateCertification({
        template,
        engineVersion,
        publicKey,
    });

    if (!result.valid) {
        console.error(`[TemplateVerifyAll] ${template.id}@${template.version} invalid: ${result.reason}`);
        failures += 1;
    }
}

const fingerprint = computeRegistryFingerprint(templates);

if (failures > 0) {
    console.error(`[TemplateVerifyAll] FAIL — ${failures} invalid templates.`);
    process.exit(1);
}

console.log('[TemplateVerifyAll] OK');
console.log(`[TemplateVerifyAll] Registry fingerprint: ${fingerprint}`);
process.exit(0);
