import { NextResponse } from 'next/server';
import { loadCertifiedTemplates } from '@/engine/templates/templateLoader.js';

export function GET(request) {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('mode') || null;
    const templates = loadCertifiedTemplates({ mode });
    return NextResponse.json({ templates });
}
