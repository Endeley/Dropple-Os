import { useCallback, useEffect, useMemo, useState } from 'react';
import { installCertifiedTemplate } from '@/domain/templates/installCertifiedTemplate.js';
import { useDispatcher } from '@/runtime/boundary/DispatcherContext.jsx';

export function useCertifiedTemplates({ mode = null, loadCertifiedTemplates }) {
    const dispatcher = useDispatcher();
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const loader = useMemo(() => loadCertifiedTemplates, [loadCertifiedTemplates]);

    useEffect(() => {
        let mounted = true;

        async function load() {
            if (typeof loader !== 'function') {
                if (mounted) {
                    setTemplates([]);
                    setError(null);
                }
                return;
            }

            try {
                setLoading(true);
                setError(null);
                const result = await loader({ mode });
                if (mounted) {
                    setTemplates(Array.isArray(result) ? result : []);
                }
            } catch (err) {
                if (mounted) {
                    setTemplates([]);
                    setError(err);
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        }

        load();

        return () => {
            mounted = false;
        };
    }, [loader, mode]);

    const install = useCallback(
        (template) => installCertifiedTemplate({ dispatcher, template }),
        [dispatcher],
    );

    return { templates, install, loading, error };
}
