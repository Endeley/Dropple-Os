'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

import { buildProjectHomeSnapshot } from '@/runtime/workspaces/projectHomeSnapshot.js';
import { buildProjectHomeResumeRoute } from '@/runtime/workspaces/projectHomeResumeRoute.js';
import {
    buildProjectIntentRecommendationRoute,
    resolveProjectIntentBlueprintRecommendations,
} from '@/runtime/workspaces/projectIntentBlueprintRecommendation.js';
import { loadRegistry } from '@/infrastructure/persistence/documentRegistry.js';
import { getActiveDocument } from '@/infrastructure/persistence/activeDocument.js';

export default function ProjectHomeClient({ recommendedBlueprints = [], blueprintCatalog = [] }) {
    const [recentProjects, setRecentProjects] = useState([]);
    const [activeDocumentId, setActiveDocumentId] = useState(null);
    const [intent, setIntent] = useState('');

    useEffect(() => {
        setRecentProjects(loadRegistry());
        setActiveDocumentId(getActiveDocument());
    }, []);

    const snapshot = useMemo(
        () =>
            buildProjectHomeSnapshot({
                recentProjects: recentProjects.map((project) =>
                    Object.freeze({
                        projectId: project.id,
                        name: project.name ?? 'Untitled',
                        updatedAt: project.updatedAt ?? null,
                    }),
                ),
                recommendedBlueprints,
                continueRoute: buildProjectHomeResumeRoute(activeDocumentId),
            }),
        [activeDocumentId, recentProjects, recommendedBlueprints],
    );

    const intentRecommendations = useMemo(
        () =>
            resolveProjectIntentBlueprintRecommendations({
                intent,
                blueprints: blueprintCatalog,
            }),
        [blueprintCatalog, intent],
    );

    return (
        <main style={{ padding: 32, display: 'grid', gap: 16 }}>
            <h1>Dropple OS</h1>
            <p>Project-centered creative operating system.</p>

            <section aria-label='Start from Intent'>
                <h2 style={{ fontSize: 18, marginBottom: 8 }}>Start from Intent</h2>
                <label htmlFor='project-intent-input' style={{ display: 'block', marginBottom: 8 }}>
                    Describe what you want to build
                </label>
                <input
                    id='project-intent-input'
                    type='text'
                    value={intent}
                    onChange={(event) => setIntent(event.target.value)}
                    placeholder='Build a trucking company'
                    style={{ width: '100%', maxWidth: 480, padding: '10px 12px' }}
                />
                {intent.trim().length === 0 ? null : intentRecommendations.length === 0 ? (
                    <p style={{ marginBottom: 0, color: '#475569' }}>No certified blueprint recommendation yet.</p>
                ) : (
                    <ul style={{ marginBottom: 0, paddingLeft: 20 }}>
                        {intentRecommendations.map((blueprint) => (
                            <li key={blueprint.id}>
                                <Link href={buildProjectIntentRecommendationRoute(blueprint.id)}>
                                    Start with {blueprint.name}
                                </Link>{' '}
                                <span style={{ color: '#475569' }}>{blueprint.description}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            <section aria-label='Recent Projects'>
                <h2 style={{ fontSize: 18, marginBottom: 8 }}>Recent Projects</h2>
                {snapshot.recentProjects.length === 0 ? (
                    <p style={{ margin: 0 }}>No recent projects yet.</p>
                ) : (
                    <ul>
                        {snapshot.recentProjects.map((project) => (
                            <li key={project.projectId}>
                                <Link href={`/workspace/new?doc=${encodeURIComponent(project.projectId)}`}>
                                    {project.name}
                                </Link>{' '}
                                <span style={{ color: '#475569' }}>({project.projectId})</span>
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            <section aria-label='Continue Working'>
                <h2 style={{ fontSize: 18, marginBottom: 8 }}>Continue Working</h2>
                <Link href={snapshot.continueRoute}>Open Project Space</Link>
            </section>

            <section aria-label='Recommended Blueprints'>
                <h2 style={{ fontSize: 18, marginBottom: 8 }}>Recommended Blueprints</h2>
                <ul>
                    {snapshot.recommendedBlueprints.map((blueprint) => (
                        <li key={blueprint.id}>
                            <strong>{blueprint.name}</strong>: {blueprint.description}
                        </li>
                    ))}
                </ul>
            </section>

            <section aria-label='Marketplace'>
                <h2 style={{ fontSize: 18, marginBottom: 8 }}>Marketplace</h2>
                <Link href={snapshot.marketplaceRoute}>Browse Marketplace</Link>
            </section>
        </main>
    );
}
