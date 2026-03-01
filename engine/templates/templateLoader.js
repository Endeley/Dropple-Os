import fs from 'fs';
import path from 'path';
import { hashEngineVersion, verifyTemplateCertification } from '../../domain/templates/TemplateCertification.js';

const REGISTRY_PATH = path.join(process.cwd(), '.registry', 'certifiedTemplates.json');

export function loadCertifiedTemplates({ mode = null, engineVersion = null, publicKey = null } = {}) {
    if (!fs.existsSync(REGISTRY_PATH)) return [];

    const raw = fs.readFileSync(REGISTRY_PATH, 'utf-8');
    const templates = JSON.parse(raw);

    if (!Array.isArray(templates)) return [];

    let filtered = templates;
    if (mode) {
        filtered = filtered.filter((t) => t.mode === mode);
    }

    if (engineVersion) {
        const engineHash = hashEngineVersion(engineVersion);
        filtered = filtered.filter(
            (t) => t?.certification?.engineHash === engineHash
        );
    }

    if (publicKey && engineVersion) {
        filtered = filtered.filter((t) => {
            const result = verifyTemplateCertification({
                template: t,
                engineVersion,
                publicKey,
            });
            return result.valid === true;
        });
    }

    return filtered;
}
