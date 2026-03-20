'use client';

import { useCallback, useState } from 'react';

export function useGraphConnectionInteraction() {
    const [connection, setConnection] = useState(null);

    const startConnection = useCallback((fromNodeId, pointerX, pointerY) => {
        setConnection({
            fromNodeId,
            pointerX,
            pointerY,
        });
    }, []);

    const updateConnection = useCallback((pointerX, pointerY) => {
        setConnection((current) => {
            if (!current) return current;

            return {
                ...current,
                pointerX,
                pointerY,
            };
        });
    }, []);

    const endConnection = useCallback(() => {
        setConnection(null);
    }, []);

    return {
        connection,
        startConnection,
        updateConnection,
        endConnection,
    };
}
