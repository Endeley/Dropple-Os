import { NextResponse } from 'next/server';
import { loadCertifiedTemplates } from '@/engine/templates/templateLoader.js';
import { ArtifactKind } from '@/gallery/artifacts/types.js';

function normalizeMarketplaceTemplate(template) {
    const metadata = template?.metadata ?? {};
    const title = metadata.title ?? metadata.name ?? template?.id ?? 'Untitled Template';
    const description = metadata.description ?? '';
    const creatorName =
        metadata?.creator?.name ??
        metadata?.author ??
        'Unknown';
    const creatorRegion = metadata?.creator?.region ?? '';
    const fallbackCreatorId =
        String(creatorName).trim().toLowerCase().replace(/[^a-z0-9]+/g, '-') ||
        'unknown';

    return {
        ...template,
        artifact: {
            kind: ArtifactKind.ENVIRONMENT,
        },
        metadata: {
            ...metadata,
            title,
            name: metadata?.name ?? title,
            description,
            creator: {
                id: metadata?.creator?.id ?? fallbackCreatorId,
                name: creatorName,
                region: creatorRegion,
            },
            pricing: metadata?.pricing ?? { free: true },
            tags: Array.isArray(metadata?.tags) ? metadata.tags : [],
            level: metadata?.level ?? 'beginner',
            thumbnail: metadata?.thumbnail ?? null,
        },
    };
}

function loadMarketplaceTemplates() {
    return loadCertifiedTemplates().map(normalizeMarketplaceTemplate);
}

export function GET(request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id') || null;
    const creator = searchParams.get('creator') || null;
    const mode = searchParams.get('mode') || null;

    let templates = loadMarketplaceTemplates();

    if (mode) {
        templates = templates.filter((template) => template?.mode === mode);
    }

    if (creator) {
        templates = templates.filter(
            (template) => template?.metadata?.creator?.name === creator,
        );
    }

    if (id) {
        const template = templates.find((entry) => entry?.id === id) ?? null;
        if (!template) {
            return NextResponse.json({ error: 'Template not found.' }, { status: 404 });
        }
        return NextResponse.json({ template });
    }

    return NextResponse.json({ templates });
}
