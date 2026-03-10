import { readFile } from 'node:fs/promises';

export async function resolve(specifier, context, nextResolve) {
    if (specifier.endsWith('.ts')) {
        const resolved = await nextResolve(specifier, context);
        return {
            ...resolved,
            format: 'module',
            shortCircuit: true,
        };
    }

    return nextResolve(specifier, context);
}

export async function load(url, context, nextLoad) {
    if (url.endsWith('.ts')) {
        const source = await readFile(new URL(url), 'utf8');
        return {
            format: 'module',
            source,
            shortCircuit: true,
        };
    }

    return nextLoad(url, context);
}
