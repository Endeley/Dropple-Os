'use client';

import { useRuntimeStore } from '@/runtime/stores/useRuntimeStore.js';
import { resolveToken } from '@/runtime/tokens/resolveToken.js';

function normalizeTokenQuery(pathOrValue) {
    if (typeof pathOrValue !== 'string') return pathOrValue;
    if (pathOrValue.startsWith('token.')) return pathOrValue;
    if (pathOrValue.startsWith('#')) return pathOrValue;
    if (pathOrValue.includes('.')) {
        return {
            type: 'token',
            value: pathOrValue,
        };
    }
    return pathOrValue;
}

export function useToken(pathOrValue) {
    const tokens = useRuntimeStore((s) => s.tokens);
    return resolveToken(normalizeTokenQuery(pathOrValue), tokens);
}
