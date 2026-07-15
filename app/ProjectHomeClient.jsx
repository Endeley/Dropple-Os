'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

import styles from './ProjectHomeClient.module.css';
import {
    CANONICAL_WORKSPACES,
    listCanonicalModesForWorkspace,
} from '@/platform/workspaces/canonicalRegistry.js';
import { buildProjectHomeResumeRoute } from '@/runtime/workspaces/projectHomeResumeRoute.js';
import { loadRegistry } from '@/infrastructure/persistence/documentRegistry.js';
import { getActiveDocument } from '@/infrastructure/persistence/activeDocument.js';
import LivingWorldHost from '@/ui/first-world/LivingWorldHost.jsx';
import WorldCore from '@/ui/first-world/WorldCore.jsx';
import RegionHost, { listFirstWorldRegions, listVisibleFirstWorldRegions } from '@/ui/first-world/RegionHost.jsx';
import NavigationFramework from '@/ui/first-world/NavigationFramework.jsx';

const REGION_REGISTRY = listFirstWorldRegions();
const VISIBLE_REGION_REGISTRY = listVisibleFirstWorldRegions();
const WORKSPACE_ORDER = Object.freeze(VISIBLE_REGION_REGISTRY.map((region) => region.id));

const WORKSPACE_STORIES = Object.freeze({
    build: Object.freeze({
        label: 'Build',
        identity: 'structured',
        eyebrow: 'Languages for systems, logic, and automation.',
        description:
            'Bring software systems and product behavior into form. Model flows, decision structures, operational logic, and machine-assisted work without leaving the living world.',
        icon: '</>',
        accent: '#3b82f6',
        glow: 'rgba(59, 130, 246, 0.34)',
    }),
    collaborate: Object.freeze({
        label: 'Collaborate',
        identity: 'collective',
        eyebrow: 'Languages for review, production, and shared knowledge.',
        description:
            'Inspect work, guide quality, coordinate delivery, and structure learning. Collaboration is not a side utility here; it is a region of the same world.',
        icon: '◉',
        accent: '#a855f7',
        glow: 'rgba(168, 85, 247, 0.34)',
    }),
    design: Object.freeze({
        label: 'Design',
        identity: 'expressive',
        eyebrow: 'Languages for interfaces, graphics, and documents.',
        description:
            'Shape interfaces, visual systems, editorial structure, and expressive artifacts. Move between UI, graphic, and document grammars inside one continuous design region.',
        icon: '✦',
        accent: '#f59e0b',
        glow: 'rgba(245, 158, 11, 0.34)',
    }),
    media: Object.freeze({
        label: 'Media',
        identity: 'cinematic',
        eyebrow: 'Languages for motion, film, and sound.',
        description:
            'Work with time, sequence, and cinematic rhythm. Enter motion, video, and audio languages as living forms rather than disconnected editors.',
        icon: '▶',
        accent: '#14b8a6',
        glow: 'rgba(20, 184, 166, 0.34)',
    }),
    system: Object.freeze({
        label: 'System',
        identity: 'ordered',
        eyebrow: 'Languages for foundations, components, and governance.',
        description:
            'Define tokens, reusable components, and operational rules that give the rest of Dropple its structure. This is where durable systems become explicit.',
        icon: '◌',
        accent: '#f97316',
        glow: 'rgba(249, 115, 22, 0.34)',
    }),
});

const MODE_DESCRIPTIONS = Object.freeze({
    uiux: 'Interfaces and product flows.',
    graphic: 'Visual systems and graphic composition.',
    document: 'Structured written artifacts.',
    animation: 'Motion, choreography, and time.',
    video: 'Filmed and edited media.',
    audio: 'Spoken and sonic sequences.',
    application: 'Software systems and product behavior.',
    logic: 'Flows, rules, and structured reasoning.',
    automation: 'Repeatable operations and machine-assisted work.',
    tokens: 'Reusable design primitives.',
    components: 'Shared component libraries.',
    governance: 'Rules and constitutional systems.',
    review: 'Feedback and quality guidance.',
    production: 'Release and execution readiness.',
    knowledge: 'Teaching, explanation, and learning.',
});

function buildWorkspaceSections() {
    return VISIBLE_REGION_REGISTRY.filter((region) => region.id !== 'home').map((region) => {
        const workspaceId = region.id;
        const story = WORKSPACE_STORIES[workspaceId];
        const workspace = CANONICAL_WORKSPACES[workspaceId];
        const modes = listCanonicalModesForWorkspace(workspaceId).map((mode) =>
            Object.freeze({
                id: mode.id,
                label: mode.label,
                href: `/workspace/${mode.id}`,
                description:
                    MODE_DESCRIPTIONS[mode.id] ?? 'Enter this language to continue your creation.',
            }),
        );

        return Object.freeze({
            id: workspaceId,
            regionTitle: region.title,
            regionPurpose: region.purpose,
            regionAvailability: region.availability,
            regionEntryLabel: region.entryLabel,
            workspaceLabel: workspace?.label ?? story.label,
            label: story.label,
            identity: story.identity,
            eyebrow: story.eyebrow,
            description: story.description,
            icon: story.icon,
            accent: story.accent,
            glow: story.glow,
            defaultModeHref: `/workspace/${workspace?.defaultMode ?? modes[0]?.id ?? 'uiux'}`,
            modes,
        });
    });
}

const WORKSPACE_SECTIONS = buildWorkspaceSections();

function ParticleField({ accent, prefix }) {
    return (
        <div className={styles.particles} aria-hidden='true'>
            {[0, 1, 2, 3, 4, 5].map((index) => (
                <span
                    key={`${prefix}-${index}`}
                    className={styles.particle}
                    style={{
                        '--accent': accent,
                        '--delay': `${index * 0.6}s`,
                        '--x': `${12 + index * 13}%`,
                        '--y': `${14 + (index % 3) * 26}%`,
                        '--size': `${8 + (index % 3) * 7}px`,
                    }}
                />
            ))}
        </div>
    );
}

function HeroOrbit() {
    return (
        <div className={styles.heroVisual} aria-hidden='true'>
            <div className={styles.heroPlanet} />
            <div className={styles.heroRing} />
            {WORKSPACE_SECTIONS.map((section, index) => (
                <div
                    key={section.id}
                    className={styles.heroCard}
                    style={{
                        '--accent': section.accent,
                        '--glow': section.glow,
                        '--rotation': `${index * 72}deg`,
                        '--delay': `${index * 0.7}s`,
                    }}
                >
                    <span className={styles.heroCardIcon}>{section.icon}</span>
                    <span>{section.label}</span>
                </div>
            ))}
            <ParticleField accent='rgba(129, 140, 248, 0.8)' prefix='hero' />
        </div>
    );
}

function getRegionResponseState(activeRegionId, regionId) {
    const activeRegionIndex = WORKSPACE_ORDER.indexOf(activeRegionId);
    const regionIndex = WORKSPACE_ORDER.indexOf(regionId);

    if (activeRegionIndex === -1 || regionIndex === -1) {
        return 'distant';
    }

    if (activeRegionId === regionId) {
        return 'active';
    }

    if (Math.abs(activeRegionIndex - regionIndex) === 1) {
        return 'nearby';
    }

    return 'distant';
}

export default function ProjectHomeClient() {
    const [recentProjects, setRecentProjects] = useState([]);
    const [activeDocumentId, setActiveDocumentId] = useState(null);

    useEffect(() => {
        setRecentProjects(loadRegistry());
        setActiveDocumentId(getActiveDocument());
    }, []);

    const continueRoute = useMemo(
        () => buildProjectHomeResumeRoute(activeDocumentId),
        [activeDocumentId],
    );

    return (
        <LivingWorldHost
            activeRegionId='home'
            regionIds={REGION_REGISTRY.map((region) => region.id)}
            worldId='dropple-first-world'
        >
            <WorldCore worldId='dropple-first-world' originRegionId='home'>
                <RegionHost regions={REGION_REGISTRY}>
                    <NavigationFramework regions={REGION_REGISTRY} defaultActiveRegionId='home'>
                        {({ activeRegionId, getRegionHref, requestRegionTravel, travelingRegionId }) => (
                            <main
                                className={styles.page}
                                data-active-region={activeRegionId}
                                data-world-layout='spatial'
                            >
                                <div className={styles.pageGlow} aria-hidden='true' />

                                <nav className={styles.sideRail} aria-label='First World sections'>
                                    <div className={styles.railLine} aria-hidden='true' />
                                    {WORKSPACE_ORDER.map((sectionId) => {
                                        const responseState = getRegionResponseState(activeRegionId, sectionId);
                                        const label =
                                            sectionId === 'home'
                                                ? 'Home'
                                                : WORKSPACE_SECTIONS.find((section) => section.id === sectionId)?.label ??
                                                  sectionId;

                                        return (
                                            <a
                                                key={sectionId}
                                                href={getRegionHref(sectionId)}
                                                className={styles.railLink}
                                                data-active={activeRegionId === sectionId ? 'true' : 'false'}
                                                data-response-state={responseState}
                                                data-traveling={travelingRegionId === sectionId ? 'true' : 'false'}
                                                onClick={(event) => {
                                                    event.preventDefault();
                                                    requestRegionTravel(sectionId);
                                                }}
                                            >
                                                <span className={styles.railDot} />
                                                <span className={styles.railLabel}>{label}</span>
                                            </a>
                                        );
                                    })}
                                </nav>

                                <div className={styles.worldLayout}>
                                    <section
                                        id='home'
                                        className={`${styles.section} ${styles.heroSection} ${styles.worldCoreSection}`}
                                        data-first-world-section='true'
                                        data-response-state={getRegionResponseState(activeRegionId, 'home')}
                                    >
                                        <div className={styles.sectionInner}>
                                            <div className={styles.heroCopy}>
                                                <p className={styles.eyebrow}>Dropple First World</p>
                                                <h1 className={styles.heroTitle}>The Living World of Creation</h1>
                                                <p className={styles.heroBody}>
                                                    Dropple is your creative universe. Choose a language of creation and
                                                    enter a world that matches your vision, your workflow, and your
                                                    imagination.
                                                </p>
                                                <div className={styles.heroActions}>
                                                    <a
                                                        href={getRegionHref('build')}
                                                        className={styles.primaryButton}
                                                        onClick={(event) => {
                                                            event.preventDefault();
                                                            requestRegionTravel('build');
                                                        }}
                                                    >
                                                        Explore Languages
                                                    </a>
                                                    <Link href={continueRoute} className={styles.secondaryButton}>
                                                        Resume active context
                                                    </Link>
                                                </div>
                                                <aside className={styles.supportPanel}>
                                                    <p className={styles.supportLabel}>Continuity</p>
                                                    <p className={styles.supportText}>
                                                        Returning work remains available, but this place is defined by
                                                        discovery before direction.
                                                    </p>
                                                    {recentProjects.length === 0 ? (
                                                        <p className={styles.supportMeta}>No recent projects yet.</p>
                                                    ) : (
                                                        <div className={styles.recentList}>
                                                            {recentProjects.slice(0, 3).map((project) => (
                                                                <Link
                                                                    key={project.id}
                                                                    href={`/workspace/new?doc=${encodeURIComponent(project.id)}`}
                                                                    className={styles.recentProjectLink}
                                                                >
                                                                    <span>{project.name ?? 'Untitled'}</span>
                                                                    <span className={styles.recentProjectMeta}>
                                                                        {project.updatedAt ?? project.id}
                                                                    </span>
                                                                </Link>
                                                            ))}
                                                        </div>
                                                    )}
                                                </aside>
                                            </div>

                                            <HeroOrbit />
                                        </div>
                                        <div className={styles.scrollPrompt}>Travel through the world</div>
                                    </section>
                                    {WORKSPACE_SECTIONS.map((section) => (
                                        <section
                                            key={section.id}
                                            id={section.id}
                                            className={`${styles.section} ${styles.worldRegionSection}`}
                                            data-first-world-section='true'
                                            data-region-id={section.id}
                                            data-region-identity={section.identity}
                                            data-response-state={getRegionResponseState(activeRegionId, section.id)}
                                            style={{
                                                '--accent': section.accent,
                                                '--glow': section.glow,
                                            }}
                                        >
                                            <div className={styles.sectionInner}>
                                                <div className={styles.workspaceVisual}>
                                                    <div className={styles.workspaceAura} />
                                                    <div className={styles.workspaceRing} />
                                                    <div className={styles.workspaceCard}>
                                                        <span className={styles.workspaceCardIcon}>{section.icon}</span>
                                                        <span className={styles.workspaceCardLabel}>{section.label}</span>
                                                    </div>
                                                    <ParticleField accent={section.accent} prefix={section.id} />
                                                </div>

                                                <div className={styles.workspaceCopy}>
                                                    <p className={styles.sectionTag}>{section.workspaceLabel}</p>
                                                    <h2 className={styles.sectionTitle}>{section.label}</h2>
                                                    <p className={styles.sectionEyebrow}>{section.eyebrow}</p>
                                                    <div className={styles.regionDetails}>
                                                        <p className={styles.sectionDescription}>{section.description}</p>
                                                        <div className={styles.modePills}>
                                                            {section.modes.map((mode) => (
                                                                <Link
                                                                    key={mode.id}
                                                                    href={mode.href}
                                                                    className={styles.modePill}
                                                                >
                                                                    {mode.label}
                                                                </Link>
                                                            ))}
                                                        </div>
                                                        <div className={styles.modeDescriptions}>
                                                            {section.modes.map((mode) => (
                                                                <div key={mode.id} className={styles.modeDescriptionCard}>
                                                                    <strong>{mode.label}</strong>
                                                                    <span>{mode.description}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <div className={styles.sectionActions}>
                                                            <Link
                                                                href={section.defaultModeHref}
                                                                className={styles.primaryButton}
                                                            >
                                                                Start Creating
                                                            </Link>
                                                            <a
                                                                href={getRegionHref('home')}
                                                                className={styles.secondaryButton}
                                                                onClick={(event) => {
                                                                    event.preventDefault();
                                                                    requestRegionTravel('home');
                                                                }}
                                                            >
                                                                Return to the First World
                                                            </a>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </section>
                                    ))}
                                </div>

                                <footer className={styles.footer}>
                                    <span className={styles.footerCopy}>
                                        Marketplace, blueprints, and support systems remain part of Dropple, but they do
                                        not define the First World.
                                    </span>
                                    <Link href='/marketplace' className={styles.footerLink}>
                                        Browse Marketplace
                                    </Link>
                                </footer>
                            </main>
                        )}
                    </NavigationFramework>
                </RegionHost>
            </WorldCore>
        </LivingWorldHost>
    );
}
