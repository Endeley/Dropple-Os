import { useEffect, useState } from 'react';
import { subscribeUXWarnings } from '@/runtime/dispatcher/ux/uxWarningBus.js';

export function useUXWarnings() {
    const [lastWarning, setLastWarning] = useState(null);

    useEffect(() => {
        return subscribeUXWarnings((event) => {
            setLastWarning(event ?? null);
        });
    }, []);

    return lastWarning;
}
