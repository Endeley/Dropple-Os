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

    useEffect(() => {
        setActiveRegionId((currentRegionId) => resolveRegionId(currentRegionId));
    }, [fallbackRegionId, registeredRegionIds]);

    useEffect(() => {
        if (typeof window === 'undefined') {
            return undefined;
        }

        const updateFromHash = () => {
            setActiveRegionId(resolveRegionId(window.location.hash));
        };

        updateFromHash();
        window.addEventListener('hashchange', updateFromHash);

        return () => {
            window.removeEventListener('hashchange', updateFromHash);
        };
    }, [fallbackRegionId, registeredRegionIds]);

    useEffect(() => {
        const sections = Array.from(document.querySelectorAll('[data-first-world-section]')).filter((section) =>
            registeredRegionIds.includes(section.id),
        );

        if (sections.length === 0) {
            return undefined;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                if (typeof window !== 'undefined' && window.location.hash) {
                    const hashedRegionId = normalizeRegionId(window.location.hash);

                    if (hashedRegionId && registeredRegionIds.includes(hashedRegionId)) {
                        setActiveRegionId(hashedRegionId);
                        return;
                    }
                }

                const visibleSection = entries
                    .filter((entry) => entry.isIntersecting)
                    .sort((left, right) => right.intersectionRatio - left.intersectionRatio)[0];

                if (!visibleSection?.target?.id) {
                    return;
                }

                setActiveRegionId(resolveRegionId(visibleSection.target.id));
            },
            {
                rootMargin: '-20% 0px -20% 0px',
                threshold: [0.25, 0.5, 0.75],
            },
        );

        sections.forEach((section) => observer.observe(section));

        return () => {
            observer.disconnect();
        };
    }, [fallbackRegionId, registeredRegionIds]);

    const framework = Object.freeze({
        activeRegionId,
        defaultActiveRegionId: fallbackRegionId,
        registeredRegionIds,
        getRegionHref(regionId) {
            return `#${resolveRegionId(regionId)}`;
        },
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
