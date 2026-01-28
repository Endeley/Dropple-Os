'use client';

import { useValidationStore } from './validationStore.js';

export function useValidationIssues() {
    return useValidationStore((state) => state.issues);
}
