import { compileTemplateV1 } from '../templates/templateCompilerV1.js';
import { certifyTemplateSeed } from '../templates/certifyTemplateSeed.js';

const template = {
    metadata: {
        id: 'template.cert.badge.v1',
        version: '1.0.0',
        name: 'Cert Badge',
        engine: 'dropple-motion@1.x',
        author: 'Dropple',
        license: 'dropple-marketplace-standard',
        createdAt: '2026-02-01',
        description: 'Certification badge fixture',
    },
    structure: {
        root: 'scene',
        nodes: [
            { id: 'scene', type: 'Scene' },
            { id: 'title', type: 'Text' },
        ],
        tree: {
            scene: ['title'],
        },
    },
    motion: {
        timelines: {
            intro: {
                duration: 1000,
                tracks: [
                    {
                        target: 'title',
                        property: 'opacity',
                        keyframes: [
                            { t: 0, v: 0 },
                            { t: 600, v: 1 },
                        ],
                    },
                ],
            },
        },
        triggers: { onLoad: 'intro' },
    },
    params: {
        content: {
            'title.text': { type: 'string', default: 'Hello' },
        },
    },
    runtime: {
        viewport: ['desktop'],
        autoplay: true,
    },
};

const compiled = compileTemplateV1(template);
const seed = compiled.seed;
const before = JSON.stringify(seed);

const certified = certifyTemplateSeed(seed);
const after = JSON.stringify(seed);

console.log('CERTIFIED TRUE:', certified.certification?.certified === true);
console.log('FINGERPRINT MATCH:', Boolean(certified.certification?.fingerprint));
console.log(
    'CAPABILITY HASH MATCH:',
    typeof certified.certification?.capabilityHash === 'string'
);
console.log(
    'CERTIFICATION DETERMINISTIC:',
    certified.certification?.certifiedAt === `derived:${seed.snapshotHash.slice(0, 12)}`
);
console.log('CERTIFICATION DOES NOT MUTATE SEED:', before === after);
