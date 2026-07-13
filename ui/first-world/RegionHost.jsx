'use client';

export const FIRST_WORLD_REGION_REGISTRY = Object.freeze([
    Object.freeze({
        id: 'home',
        name: 'Home',
        title: 'Dropple First World',
        purpose: 'World origin and creative-language discovery.',
        entryLabel: 'Enter the First World',
        order: 0,
        availability: 'active',
        visible: true,
    }),
    Object.freeze({
        id: 'build',
        name: 'Build',
        title: 'Build',
        purpose: 'Systems, logic, and automation languages.',
        entryLabel: 'Enter Build',
        order: 1,
        availability: 'active',
        visible: true,
    }),
    Object.freeze({
        id: 'system',
        name: 'System',
        title: 'System',
        purpose: 'Foundations, components, and governance languages.',
        entryLabel: 'Enter System',
        order: 2,
        availability: 'active',
        visible: true,
    }),
    Object.freeze({
        id: 'design',
        name: 'Design',
        title: 'Design',
        purpose: 'Interfaces, graphics, and documents.',
        entryLabel: 'Enter Design',
        order: 3,
        availability: 'active',
        visible: true,
    }),
    Object.freeze({
        id: 'media',
        name: 'Media',
        title: 'Media',
        purpose: 'Motion, film, and sound languages.',
        entryLabel: 'Enter Media',
        order: 4,
        availability: 'active',
        visible: true,
    }),
    Object.freeze({
        id: 'collaborate',
        name: 'Collaborate',
        title: 'Collaborate',
        purpose: 'Review, production, and shared knowledge.',
        entryLabel: 'Enter Collaboration',
        order: 5,
        availability: 'active',
        visible: true,
    }),
    Object.freeze({
        id: 'education',
        name: 'Education',
        title: 'Education',
        purpose: 'Learning, teaching, and guided knowledge experiences.',
        entryLabel: 'Enter Education',
        order: 6,
        availability: 'planned',
        visible: false,
    }),
    Object.freeze({
        id: 'translation',
        name: 'Translation',
        title: 'Translation',
        purpose: 'Meaning transfer across languages, formats, and contexts.',
        entryLabel: 'Enter Translation',
        order: 7,
        availability: 'planned',
        visible: false,
    }),
]);

export function listFirstWorldRegions() {
    return FIRST_WORLD_REGION_REGISTRY;
}

export function listVisibleFirstWorldRegions() {
    return FIRST_WORLD_REGION_REGISTRY.filter((region) => region.visible);
}

export default function RegionHost({
    activeRegionId = 'home',
    regions = FIRST_WORLD_REGION_REGISTRY,
    children,
}) {
    return (
        <div
            data-testid='region-host'
            data-active-region={activeRegionId}
            data-registered-region-ids={regions.map((region) => region.id).join(',')}
            style={{ display: 'contents' }}
        >
            {children}
        </div>
    );
}
