import { NextResponse } from 'next/server';
import { publishTemplateFromWorkspace } from '@/templates/publishTemplateFromWorkspace.js';

export async function POST(request) {
    try {
        const payload = await request.json();
        const result = publishTemplateFromWorkspace(payload ?? {});
        return NextResponse.json({ result });
    } catch (error) {
        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : 'Template publish failed.',
            },
            { status: 400 },
        );
    }
}
