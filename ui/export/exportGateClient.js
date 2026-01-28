'use client';

import { evaluateExportGate } from '@/export/exportGate.js';
import { useValidationStore } from '@/ui/canvas/validation/validationStore.js';

export function runExportGate() {
    const issues = useValidationStore.getState().issues ?? [];
    const result = evaluateExportGate(issues);

    if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
        const previous = window.__droppleDebug;
        window.__droppleDebug = {
            ...(previous || {}),
            exportGate: result,
        };
    }

    if (result.status === 'allow') return true;

    if (result.status === 'warn') {
        const warningText = formatIssueList(result.warnings);
        const proceed = window.confirm(
            `This export has warnings.\n\n${warningText}\n\nExport anyway?`
        );
        return proceed;
    }

    const blockText = formatIssueList(result.blockingIssues);
    window.alert(
        `Export blocked due to UX errors.\n\n${blockText}\n\nResolve validation errors to export.`
    );
    return false;
}

function formatIssueList(issues = []) {
    if (!issues.length) return 'No issues reported.';
    return issues
        .slice(0, 6)
        .map((issue) => `• ${issue.message}`)
        .join('\n');
}
