import { startTransition, useCallback, useState } from 'react';

const INITIAL_METADATA = Object.freeze({
    title: '',
    description: '',
    tags: [],
    level: 'beginner',
});

export function useTemplateGenerator() {
    const [open, setOpen] = useState(false);
    const [metadata, setMetadata] = useState(INITIAL_METADATA);
    const [isPublishing, setIsPublishing] = useState(false);
    const [error, setError] = useState(null);
    const [lastPublished, setLastPublished] = useState(null);

    const openGenerator = useCallback(() => {
        setError(null);
        setOpen(true);
    }, []);

    const closeGenerator = useCallback(() => {
        setOpen(false);
    }, []);

    const publish = useCallback(
        async ({ state, events, mode }) => {
            setIsPublishing(true);
            setError(null);

            try {
                const response = await fetch('/api/templates/publish', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        state,
                        events,
                        mode,
                        metadata,
                    }),
                });
                const payload = await response.json();

                if (!response.ok) {
                    throw new Error(payload?.error ?? 'Template publish failed.');
                }

                const result = payload?.result ?? null;

                startTransition(() => {
                    setLastPublished(result);
                    setOpen(false);
                });

                return result;
            } catch (err) {
                setError(err);
                throw err;
            } finally {
                setIsPublishing(false);
            }
        },
        [metadata],
    );

    return {
        open,
        openGenerator,
        closeGenerator,
        metadata,
        setMetadata,
        isPublishing,
        error,
        lastPublished,
        publish,
    };
}
