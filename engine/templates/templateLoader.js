import fs from 'fs';
import path from 'path';
import { hashEngineVersion, verifyTemplateCertification } from '../../domain/templates/TemplateCertification.js';
import { loadRegistryEntries } from '../../domain/templates/TemplateRegistry.js';

function getRegistryPath() {
    return path.join(process.cwd(), '.registry', 'certifiedTemplates.json');
}

export function loadCertifiedTemplates({ mode = null, engineVersion = null, publicKey = null } = {}) {
    const registryPath = getRegistryPath();
    if (!fs.existsSync(registryPath)) return [];
    const templates = loadRegistryEntries();

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
