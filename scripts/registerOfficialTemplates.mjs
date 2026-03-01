import fs from 'fs';
import path from 'path';
import { certifyTemplate } from '../domain/templates/TemplateCertification.js';
import { registerTemplate } from '../domain/templates/TemplateRegistry.js';
import { uiuxStarterTemplate } from '../domain/templates/official/uiuxStarter.template.js';

const privateKeyPath = path.join(process.cwd(), 'keys', 'private.pem');
const publicKeyPath = path.join(process.cwd(), 'keys', 'public.pem');

if (!fs.existsSync(privateKeyPath) || !fs.existsSync(publicKeyPath)) {
    throw new Error('Missing keys/private.pem or keys/public.pem');
}

const privateKey = fs.readFileSync(privateKeyPath);
const publicKey = fs.readFileSync(publicKeyPath);
const engineVersion = '1.0.0';

async function main() {
    console.log('Certifying template...');

    const certified = certifyTemplate({
        template: uiuxStarterTemplate,
        engineVersion,
        privateKey,
    });

    console.log('Registering template...');

    const result = registerTemplate({
        template: certified,
        engineVersion,
        publicKey,
    });

    console.log('Registered successfully.');
    console.log('Registry fingerprint:', result.fingerprint);
}

main();
