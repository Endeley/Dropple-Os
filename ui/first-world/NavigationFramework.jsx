'use client';

import { useEffect, useMemo, useState } from 'react';

function normalizeRegionId(regionId) {
    if (typeof regionId !== 'string') {
        return null;
    }

    return regionId.replace(/^#/, '').trim() || null;
}

function resolveFallbackRegionId(regions, defaultActiveRegionId) {
    const requestedDefault = normalizeRegionId(defaultActiveRegionId);
    const regionIds = new Set(regions.map((region) => region.id));

    if (requestedDefault && regionIds.has(requestedDefault)) {
        return requestedDefault;
    }

    return regions[0]?.id ?? 'home';
}

export default function NavigationFramework({
    regions = [],
    defaultActiveRegionId = 'home',
    children,
}) {
    const registeredRegionIds = useMemo(() => regions.map((region) => region.id), [regions]);
    const fallbackRegionId = useMemo(
        () => resolveFallbackRegionId(regions, defaultActiveRegionId),
        [regions, defaultActiveRegionId],
    );

    const resolveRegionId = (candidateRegionId) => {
        const normalizedRegionId = normalizeRegionId(candidateRegionId);

        if (normalizedRegionId && registeredRegionIds.includes(normalizedRegionId)) {
            return normalizedRegionId;
        }

        return fallbackRegionId;
    };

    const [activeRegionId, setActiveRegionId] = useState(fallbackRegionId);
    const requestRegionTravel = (requestedRegionId) => {
        if (typeof window === 'undefined') {
            return fallbackRegionId;
        }

        const resolvedRegionId = resolveRegionId(requestedRegionId);

        setActiveRegionId(resolvedRegionId);
        window.history.replaceState(null, '', `#${resolvedRegionId}`);

        return resolvedRegionId;
    };

    useEffect(() => {
        setActiveRegionId((currentRegionId) => resolveRegionId(currentRegionId));
    }, [fallbackRegionId, registeredRegionIds]);

    useEffect(() => {
        if (typeof window === 'undefined') {
            return undefined;
        }

        const updateFromHash = () => {
            const normalizedHashRegionId = normalizeRegionId(window.location.hash);
            const hasRegisteredHash =
                normalizedHashRegionId && registeredRegionIds.includes(normalizedHashRegionId);
            const resolvedHashRegionId = resolveRegionId(window.location.hash);
            setActiveRegionId(resolvedHashRegionId);
        };

        updateFromHash();
        window.addEventListener('hashchange', updateFromHash);

        return () => {
            window.removeEventListener('hashchange', updateFromHash);
        };
    }, [fallbackRegionId, registeredRegionIds]);

    const framework = Object.freeze({
        activeRegionId,
        defaultActiveRegionId: fallbackRegionId,
        registeredRegionIds,
        getRegionHref(regionId) {
            return `#${resolveRegionId(regionId)}`;
        },
        requestRegionTravel,
        resolveRegionId,
    });

    return (
        <div
            data-testid='navigation-framework'
            data-active-region={framework.activeRegionId}
            data-default-region={framework.defaultActiveRegionId}
            data-registered-region-ids={framework.registeredRegionIds.join(',')}
            style={{ display: 'contents' }}
        >
            {typeof children === 'function' ? children(framework) : children}
        </div>
    );
}
