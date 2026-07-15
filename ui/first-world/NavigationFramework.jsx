'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

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
    const [travelingRegionId, setTravelingRegionId] = useState(null);
    const travelResetRef = useRef(null);

    const clearTravelState = () => {
        if (travelResetRef.current) {
            window.clearTimeout(travelResetRef.current);
            travelResetRef.current = null;
        }

        setTravelingRegionId(null);
    };

    const requestRegionTravel = (requestedRegionId) => {
        if (typeof window === 'undefined') {
            return fallbackRegionId;
        }

        const resolvedRegionId = resolveRegionId(requestedRegionId);
        const targetSection = document.getElementById(resolvedRegionId);
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        setActiveRegionId(resolvedRegionId);
        setTravelingRegionId(resolvedRegionId);
        window.history.replaceState(null, '', `#${resolvedRegionId}`);

        if (targetSection) {
            targetSection.scrollIntoView({
                behavior: prefersReducedMotion ? 'auto' : 'smooth',
                block: 'start',
            });
        }

        if (travelResetRef.current) {
            window.clearTimeout(travelResetRef.current);
        }

        travelResetRef.current = window.setTimeout(() => {
            setTravelingRegionId(null);
            travelResetRef.current = null;
        }, prefersReducedMotion ? 0 : 420);

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
            setActiveRegionId(resolveRegionId(window.location.hash));
            clearTravelState();
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

    useEffect(() => {
        return () => {
            if (typeof window !== 'undefined' && travelResetRef.current) {
                window.clearTimeout(travelResetRef.current);
            }
        };
    }, []);

    const framework = Object.freeze({
        activeRegionId,
        defaultActiveRegionId: fallbackRegionId,
        registeredRegionIds,
        travelingRegionId,
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
            data-traveling-region={framework.travelingRegionId ?? ''}
            style={{ display: 'contents' }}
        >
            {typeof children === 'function' ? children(framework) : children}
        </div>
    );
}
