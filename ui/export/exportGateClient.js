'use client';

import { evaluateExportGate } from '@/export/exportGate.js';
import { useValidationStore } from '@/ui/canvas/validation/validationStore.js';
import { useExportGateStore } from './exportGateStore';

export function runExportGate({ onProceed } = {}) {
    const issues = useValidationStore.getState().issues ?? [];
    const result = evaluateExportGate(issues);

    if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
        const previous = window.__droppleDebug;
        window.__droppleDebug = {
            ...(previous || {}),
            exportGate: result,
        };
    }

    if (result.status === 'allow') {
        onProceed?.();
        return true;
    }

    if (typeof window !== 'undefined') {
        useExportGateStore.getState().openSheet(result, onProceed);
    }

    return false;
}
