import { workspaceToCCMTemplate } from './workspaceToCCMTemplate.js';
import { compileTemplateV1 } from '@/engine/templates/templateCompilerV1.js';
import { hashEngineVersion, registerTemplateCertification } from '@/domain/templates/TemplateCertification.js';
import { registerTemplate } from '@/domain/templates/TemplateRegistry.js';

function slugify(value) {
    return String(value ?? '')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function buildMetadata({ metadata = {}, workspaceMode = 'design' }) {
    const title = String(metadata?.title ?? metadata?.name ?? '').trim();
    const name = title || 'Untitled Template';
    const slug = slugify(name) || crypto.randomUUID();

    return {
        id: metadata?.id ?? `tpl.${workspaceMode}.${slug}`,
        version: metadata?.version ?? '1.0.0',
        name,
        engine: metadata?.engine ?? 'dropple-motion@1.x',
        author: metadata?.author ?? '',
        license: metadata?.license ?? 'dropple-marketplace-standard',
        createdAt: metadata?.createdAt ?? new Date().toISOString(),
        description: metadata?.description ?? '',
    };
}

function withRegistryCertification(seed, workspaceMode) {
    const engineVersion = seed?.certification?.engineVersion ?? seed?.metadata?.engine ?? 'dropple-motion@1.x';

    return {
        ...seed,
        mode: workspaceMode,
        certification: registerTemplateCertification({
            certification: seed?.certification,
            engineVersion,
        }),
    };
}

export function publishTemplateFromWorkspace({
    document,
    state,
    events = [],
    metadata = {},
    mode = null,
    workspaceMode = null,
} = {}) {
    const resolvedMode = workspaceMode ?? mode?.id ?? mode ?? 'design';
    const resolvedDocument = document ?? state?.document ?? state;

    const artifact = workspaceToCCMTemplate({
        document: resolvedDocument,
        events,
        workspaceMode: resolvedMode,
        metadata: buildMetadata({ metadata, workspaceMode: resolvedMode }),
    });

    const compiled = compileTemplateV1(artifact);
    const seed = withRegistryCertification(compiled.seed, resolvedMode);
    const registration = registerTemplate({
        template: seed,
        engineVersion: seed.certification.engineVersion,
    });

    return {
        artifact,
        seed,
        capabilityProfile: compiled.capabilityProfile,
        registration: {
            ...registration,
            engineHash: hashEngineVersion(seed.certification.engineVersion),
        },
    };
}
