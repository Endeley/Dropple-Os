'use client';

import { useSuggestionStore } from './suggestionStore.js';

export function useSuggestions() {
    return useSuggestionStore((state) => state.suggestions);
}
