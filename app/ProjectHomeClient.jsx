'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
    AppWindow,
    AudioLines,
    CopyPlus,
    BookOpen,
    Boxes,
    DraftingCompass,
    Clapperboard,
    Component,
    FileText,
    MessageSquareQuote,
    PenTool,
    Rocket,
    ShieldCheck,
    Sparkles,
    SwatchBook,
    Workflow,
    Zap,
} from 'lucide-react';
import { buildHomepageLanguageLaunchHref } from '@/runtime/workspaces/index.js';
import { buildRecentWorkLaunchHref } from '@/runtime/workspaces/index.js';
import { getActiveDocument } from '@/infrastructure/persistence/activeDocument.js';
import { loadRegistry } from '@/infrastructure/persistence/documentRegistry.js';
import LivingWorldHost from '@/ui/first-world/LivingWorldHost.jsx';
import WorldCore from '@/ui/first-world/WorldCore.jsx';
import RegionHost, { FIRST_WORLD_REGION_REGISTRY } from '@/ui/first-world/RegionHost.jsx';

import styles from './ProjectHomeClient.module.css';

function buildLanguageWorkspaceHref(modeId) {
    return buildHomepageLanguageLaunchHref(modeId);
}

function buildContinueExistingWorkHref() {
    return buildRecentWorkLaunchHref({
        activeDocumentId: getActiveDocument(),
        recentDocuments: loadRegistry(),
    });
}

const LANGUAGE_ICONS = {
    Animation: Sparkles,
    Video: Clapperboard,
    Audio: AudioLines,
    UIUX: AppWindow,
    Graphic: PenTool,
    Document: FileText,
    Application: Boxes,
    Logic: Workflow,
    Automation: Zap,
    Tokens: SwatchBook,
    Components: Component,
    Governance: ShieldCheck,
    Review: MessageSquareQuote,
    Knowledge: BookOpen,
    Production: Rocket,
};

const LANGUAGE_CHAPTERS = [
    {
        id: 'media',
        workspaceLabel: 'Media',
        eyebrow: 'Motion First',
        title: 'Create through flow, timing, and momentum.',
        body: 'Animation, video, and audio begin from sequence. In Dropple, motion is not decoration. It is one of the primary grammars of creation.',
        serves: 'Serves motion, film, sound, sequence, and temporal expression.',
        atmosphere: 'Fluid, rhythmic, and alive.',
        accent: '#9b7dff',
        accentSoft: 'rgba(155, 125, 255, 0.22)',
        glow: 'rgba(180, 150, 255, 0.34)',
        scene: ['Sequence arcs', 'Signal pulses', 'Temporal layers'],
        languages: [
            {
                name: 'Animation',
                href: buildLanguageWorkspaceHref('animation'),
                body: 'Create movement, timing, scenes, transitions, and visual rhythm.',
            },
            {
                name: 'Video',
                href: buildLanguageWorkspaceHref('video'),
                body: 'Shape moving image, pacing, cuts, continuity, and cinematic flow.',
            },
            {
                name: 'Audio',
                href: buildLanguageWorkspaceHref('audio'),
                body: 'Compose sonic structure, voice, sequencing, and listening experience.',
            },
        ],
    },
    {
        id: 'design',
        workspaceLabel: 'Design',
        eyebrow: 'Design',
        title: 'Shape interfaces, visuals, and structured expression.',
        body: 'Design turns intention into visible form. This language family holds UIUX, graphic expression, and document composition inside one operating environment.',
        serves: 'Serves interfaces, visual communication, and document composition.',
        atmosphere: 'Clear, composed, and expressive.',
        accent: '#8cb4ff',
        accentSoft: 'rgba(140, 180, 255, 0.18)',
        glow: 'rgba(154, 196, 255, 0.3)',
        scene: ['Grid fields', 'Typography planes', 'Interface frames'],
        languages: [
            {
                name: 'UIUX',
                href: buildLanguageWorkspaceHref('uiux'),
                body: 'Design interfaces, flows, pages, apps, and product structure.',
            },
            {
                name: 'Graphic',
                href: buildLanguageWorkspaceHref('graphic'),
                body: 'Create campaigns, visual systems, posters, and brand expression.',
            },
            {
                name: 'Document',
                href: buildLanguageWorkspaceHref('document'),
                body: 'Compose presentations, structured pages, and editorial narrative.',
            },
        ],
    },
    {
        id: 'build',
        workspaceLabel: 'Build',
        eyebrow: 'Build',
        title: 'Construct systems, logic, and application behavior.',
        body: 'Build is where behavior becomes real. It is not about opening another tool. It is about entering the grammar of systems, logic, and executable structure.',
        serves: 'Serves product behavior, system logic, and automation.',
        atmosphere: 'Structured, connected, and deliberate.',
        accent: '#83f0d2',
        accentSoft: 'rgba(131, 240, 210, 0.18)',
        glow: 'rgba(131, 240, 210, 0.28)',
        scene: ['Flow maps', 'Logic threads', 'System nodes'],
        languages: [
            {
                name: 'Application',
                href: buildLanguageWorkspaceHref('application'),
                body: 'Build product behavior, systems, and interactive application logic.',
            },
            {
                name: 'Logic',
                href: buildLanguageWorkspaceHref('logic'),
                body: 'Define states, rules, process, and causal structure.',
            },
            {
                name: 'Automation',
                href: buildLanguageWorkspaceHref('automation'),
                body: 'Create triggers, transformations, AI-assisted execution, and repeatable flows.',
            },
        ],
    },
    {
        id: 'system',
        workspaceLabel: 'System',
        eyebrow: 'System',
        title: 'Define foundations, components, and operational order.',
        body: 'System creation is quieter. It holds the reusable laws of the world: tokens, components, and governance that give every other language consistency.',
        serves: 'Serves reusable foundations, component systems, and governance.',
        atmosphere: 'Calm, ordered, and foundational.',
        accent: '#ffbd87',
        accentSoft: 'rgba(255, 189, 135, 0.18)',
        glow: 'rgba(255, 189, 135, 0.26)',
        scene: ['Foundation blocks', 'Reusable modules', 'Governance rails'],
        languages: [
            {
                name: 'Tokens',
                href: buildLanguageWorkspaceHref('tokens'),
                body: 'Define scales, themes, variables, and shared visual foundations.',
            },
            {
                name: 'Components',
                href: buildLanguageWorkspaceHref('components'),
                body: 'Build reusable interface systems and structured variants.',
            },
            {
                name: 'Governance',
                href: buildLanguageWorkspaceHref('governance'),
                body: 'Control standards, rules, versioning, and system integrity.',
            },
        ],
    },
    {
        id: 'collaborate',
        workspaceLabel: 'Collaborate',
        eyebrow: 'Collaborate',
        title: 'Review, teach, and move work toward release.',
        body: 'Creation does not end at authorship. Dropple also holds the grammars of feedback, learning, publishing, and release inside the same living system.',
        serves: 'Serves feedback, learning, publishing, and release.',
        atmosphere: 'Open, shared, and directional.',
        accent: '#f29de3',
        accentSoft: 'rgba(242, 157, 227, 0.18)',
        glow: 'rgba(242, 157, 227, 0.28)',
        scene: ['Shared signals', 'Review threads', 'Release lanes'],
        languages: [
            {
                name: 'Review',
                href: buildLanguageWorkspaceHref('review'),
                body: 'Discuss, evaluate, approve, and iterate on work in motion.',
            },
            {
                name: 'Knowledge',
                href: buildLanguageWorkspaceHref('knowledge'),
                body: 'Teach, explain, guide, and structure understanding around creation.',
            },
            {
                name: 'Production',
                href: buildLanguageWorkspaceHref('production'),
                body: 'Coordinate release, handoff, publishing, and operational readiness.',
            },
        ],
    },
];

const STARTING_METHODS = [
    {
        title: 'Start from Blueprint',
        body: 'Begin from structure when the work needs foundations before surface.',
        href: '/marketplace?entry=blueprint',
        cta: 'Browse Blueprints',
        icon: DraftingCompass,
        accent: '#7fb7ff',
        accentSoft: 'rgba(127, 183, 255, 0.2)',
    },
    {
        title: 'Start from Template',
        body: 'Begin from expression when the work needs a faster route into creation.',
        href: '/marketplace?entry=template',
        cta: 'Browse Templates',
        icon: CopyPlus,
        accent: '#c792ff',
        accentSoft: 'rgba(199, 146, 255, 0.22)',
    },
];

const TRUST_PILLARS = [
    'One living world across all creative languages.',
    'Motion-first experience from entry to creation.',
    'Language before tools, intention before interface.',
];

const FOOTER_LINK_GROUPS = [
    ['About Dropple', 'Blueprints', 'Templates', 'Docs'],
    ['Privacy', 'Terms', 'Security', 'Sign in'],
];

const FIRST_WORLD_NAV_ENTRIES = Object.freeze([
    Object.freeze({ id: 'build', label: 'Build' }),
    Object.freeze({ id: 'design', label: 'Design' }),
    Object.freeze({ id: 'media', label: 'Media' }),
    Object.freeze({ id: 'system', label: 'System' }),
    Object.freeze({ id: 'collaborate', label: 'Collaborate' }),
]);

const REGION_IDENTITIES = Object.freeze({
    home: 'origin',
    build: 'structured',
    design: 'expressive',
    media: 'cinematic',
    system: 'ordered',
    collaborate: 'collective',
    education: 'guided',
    translation: 'transitional',
});

const PRESENCE_MARKER_STYLE = Object.freeze({
    position: 'absolute',
    width: '2px',
    height: '2px',
    opacity: 0.01,
    pointerEvents: 'none',
});

function resolveCameraRelationship(regionId, activeRegionId) {
    if (regionId === 'home') {
        return 'foreground';
    }

    if (regionId === activeRegionId) {
        return 'approaching';
    }

    return 'distant';
}

function normalizeRegionId(regionId) {
    if (typeof regionId !== 'string') {
        return null;
    }

    return regionId.replace(/^#/, '').trim() || null;
}

function resolveHomeFallbackRegionId() {
    return FIRST_WORLD_REGION_REGISTRY.find((region) => region.id === 'home')?.id ?? 'home';
}

const DEFAULT_SURFACE_MOTION = Object.freeze({
    tiltX: '0deg',
    tiltY: '0deg',
    driftX: '0px',
    driftY: '0px',
    glowX: '50%',
    glowY: '50%',
});

function InteractiveSurface({
    as: Component = 'div',
    className = '',
    style = null,
    children = null,
    ...props
}) {
    const [motionStyle, setMotionStyle] = useState(DEFAULT_SURFACE_MOTION);

    const resolvedStyle = useMemo(
        () => ({
            ...(style ?? {}),
            '--tilt-x': motionStyle.tiltX,
            '--tilt-y': motionStyle.tiltY,
            '--drift-x': motionStyle.driftX,
            '--drift-y': motionStyle.driftY,
            '--glow-x': motionStyle.glowX,
            '--glow-y': motionStyle.glowY,
        }),
        [motionStyle, style]
    );

    function handleMouseMove(event) {
        const rect = event.currentTarget.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;
        const rotateY = (x - 0.5) * 14;
        const rotateX = (0.5 - y) * 12;
        const driftX = (x - 0.5) * 10;
        const driftY = (y - 0.5) * 10;

        setMotionStyle({
            tiltX: `${rotateX.toFixed(2)}deg`,
            tiltY: `${rotateY.toFixed(2)}deg`,
            driftX: `${driftX.toFixed(2)}px`,
            driftY: `${driftY.toFixed(2)}px`,
            glowX: `${(x * 100).toFixed(2)}%`,
            glowY: `${(y * 100).toFixed(2)}%`,
        });
    }

    function handleMouseLeave() {
        setMotionStyle(DEFAULT_SURFACE_MOTION);
    }

    return (
        <Component
            className={className}
            style={resolvedStyle}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            {...props}
        >
            {children}
        </Component>
    );
}

function ChapterVisual({ chapter }) {
    return (
        <InteractiveSurface
            className={`${styles.chapterVisual} ${styles.interactiveSurface}`}
            style={{
                '--chapter-accent': chapter.accent,
                '--chapter-accent-soft': chapter.accentSoft,
                '--chapter-glow': chapter.glow,
            }}
            aria-hidden='true'
        >
            <div className={styles.visualAura} />
            <div className={styles.visualPlaneBack} />
            <div className={styles.visualPlaneMid} />
            <div className={styles.visualPlaneFront} />
            <div className={styles.visualNebula}>
                <div className={styles.visualNebulaGlow} />
                <div className={styles.visualNebulaOrb} />
                <div className={styles.visualNebulaShardA} />
                <div className={styles.visualNebulaShardB} />
                <div className={styles.visualNebulaShardC} />
                <svg
                    className={styles.visualNebulaLines}
                    viewBox='0 0 100 100'
                    preserveAspectRatio='none'
                >
                    <path d='M 18 50 C 34 18, 66 18, 82 50' />
                    <path d='M 22 64 C 36 38, 64 38, 78 64' />
                    <path d='M 26 34 C 44 62, 56 62, 74 34' />
                </svg>
                <div className={styles.visualNebulaNodeA} />
                <div className={styles.visualNebulaNodeB} />
                <div className={styles.visualNebulaNodeC} />
            </div>
            <div className={styles.visualScenePills}>
                {chapter.scene.map((item) => (
                    <div key={item} className={styles.visualScenePill}>
                        {item}
                    </div>
                ))}
            </div>
            <div className={styles.visualFrameA}>
                <div className={styles.visualFrameLabel}>FLOW</div>
                <div className={styles.visualFrameTextList}>
                    <span>Path memory</span>
                    <span>Reveal pacing</span>
                    <span>Route guidance</span>
                </div>
            </div>
            <div className={`${styles.visualFrameB} ${styles.visualFrameCentered}`}>
                <div className={styles.visualFrameLabel}>SIGNAL</div>
                <div className={`${styles.visualFrameTextList} ${styles.visualFrameTextListCentered}`}>
                    <span>Orientation cues</span>
                    <span>Ambient prompts</span>
                    <span>Arrival cues</span>
                    <span>District identity</span>
                </div>
            </div>
            <div className={styles.visualFrameC}>
                <div className={styles.visualFrameLabel}>STATE</div>
                <div className={styles.visualFrameState}>
                    <strong>Ready</strong>
                    <span>World active</span>
                </div>
            </div>
        </InteractiveSurface>
    );
}

export default function ProjectHomeClient() {
    const [continueExistingWorkHref, setContinueExistingWorkHref] = useState('/workspace/overview');
    const registeredRegionIds = useMemo(
        () => FIRST_WORLD_REGION_REGISTRY.map((region) => region.id),
        [],
    );
    const fallbackRegionId = useMemo(() => resolveHomeFallbackRegionId(), []);
    const [activeRegionId, setActiveRegionId] = useState(fallbackRegionId);

    useEffect(() => {
        const nodes = document.querySelectorAll('[data-scroll-reveal]');

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) {
                        return;
                    }

                    entry.target.classList.add(styles.revealed);
                    observer.unobserve(entry.target);
                });
            },
            {
                threshold: 0.18,
                rootMargin: '0px 0px -10% 0px',
            }
        );

        nodes.forEach((node) => observer.observe(node));

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        setContinueExistingWorkHref(buildContinueExistingWorkHref());
    }, []);

    useEffect(() => {
        const resolveRegion = (candidateRegionId) => {
            const normalizedRegionId = normalizeRegionId(candidateRegionId);
            if (normalizedRegionId && registeredRegionIds.includes(normalizedRegionId)) {
                return normalizedRegionId;
            }

            return fallbackRegionId;
        };

        const updateFromHash = () => {
            if (typeof window === 'undefined') return;
            setActiveRegionId(resolveRegion(window.location.hash));
        };

        updateFromHash();
        window.addEventListener('hashchange', updateFromHash);

        return () => {
            window.removeEventListener('hashchange', updateFromHash);
        };
    }, [fallbackRegionId, registeredRegionIds]);

    const requestRegionTravel = (requestedRegionId) => {
        const normalizedRegionId = normalizeRegionId(requestedRegionId);
        const resolvedRegionId =
            normalizedRegionId && registeredRegionIds.includes(normalizedRegionId)
                ? normalizedRegionId
                : fallbackRegionId;

        setActiveRegionId(resolvedRegionId);
        if (typeof window !== 'undefined') {
            window.history.replaceState(null, '', `#${resolvedRegionId}`);
        }

        return resolvedRegionId;
    };

    const getRegionHref = (regionId) => `#${requestRegionTravel ? (normalizeRegionId(regionId) && registeredRegionIds.includes(normalizeRegionId(regionId)) ? normalizeRegionId(regionId) : fallbackRegionId) : fallbackRegionId}`;

    return (
        <main className={styles.page} data-world-layout='spatial'>
            <LivingWorldHost
                activeRegionId={activeRegionId}
                originRegionId='home'
                regionIds={FIRST_WORLD_REGION_REGISTRY.map((region) => region.id)}
                traveler={{
                    id: 'traveler',
                    regionId: 'home',
                    state: 'present',
                    x: 0,
                    y: 140,
                    z: 0,
                }}
            >
                <WorldCore originRegionId='home'>
                    <RegionHost
                        activeRegionId={activeRegionId}
                        regions={FIRST_WORLD_REGION_REGISTRY}
                    >
                        <div
                            data-testid='navigation-framework'
                            data-active-region={activeRegionId}
                            data-default-region={fallbackRegionId}
                            data-registered-region-ids={registeredRegionIds.join(',')}
                            style={{ display: 'contents' }}
                        >
                            <div
                                data-testid='origin-region-presence'
                                data-world-entity='origin-region'
                                style={{ ...PRESENCE_MARKER_STYLE, top: 0, left: 0 }}
                            />
                            <div
                                data-testid='world-core-presence'
                                data-world-entity='world-core'
                                style={{ ...PRESENCE_MARKER_STYLE, top: 0, left: 4 }}
                            />
                            <div
                                data-testid='world-traveler-presence'
                                data-world-entity='traveler'
                                style={{ ...PRESENCE_MARKER_STYLE, top: 0, left: 8 }}
                            />
                            <nav
                                aria-label='First World sections'
                                style={{
                                    display: 'flex',
                                    gap: '12px',
                                    flexWrap: 'wrap',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    paddingTop: '96px',
                                    paddingBottom: '12px',
                                    position: 'relative',
                                    zIndex: 2,
                                }}
                            >
                                {FIRST_WORLD_NAV_ENTRIES.map((entry) => (
                                    <a
                                        key={entry.id}
                                        href={getRegionHref(entry.id)}
                                        data-testid={entry.id === 'build' ? 'creative-anchor-build' : entry.id === 'design' ? 'creative-anchor-design' : undefined}
                                        onClick={(event) => {
                                            event.preventDefault();
                                            requestRegionTravel(entry.id);
                                        }}
                                        style={{
                                            color: 'rgba(245, 240, 255, 0.86)',
                                            textDecoration: 'none',
                                            fontSize: '0.9rem',
                                            letterSpacing: '0.08em',
                                            textTransform: 'uppercase',
                                            padding: '10px 14px',
                                            borderRadius: '999px',
                                            border:
                                                activeRegionId === entry.id
                                                    ? '1px solid rgba(179, 146, 255, 0.7)'
                                                    : '1px solid rgba(190, 180, 255, 0.18)',
                                            background:
                                                activeRegionId === entry.id
                                                    ? 'rgba(110, 82, 190, 0.28)'
                                                    : 'rgba(15, 20, 46, 0.34)',
                                            boxShadow:
                                                activeRegionId === entry.id
                                                    ? '0 0 24px rgba(165, 134, 255, 0.18)'
                                                    : 'none',
                                        }}
                                    >
                                        {entry.label}
                                    </a>
                                ))}
                            </nav>
                        </div>
                    </RegionHost>
                </WorldCore>
            </LivingWorldHost>
            <div className={styles.background}>
                <div className={styles.backgroundGlow} />
                <div className={styles.backgroundFog} />
                <div className={styles.cloudBandA} />
                <div className={styles.cloudBandB} />
                <div className={styles.cloudBandC} />
                <div className={styles.sparkField} />
            </div>

            <header className={styles.floatingBrand}>
                <div className={styles.brandGlow} />
                <div className={styles.brandMark} />
                <div className={styles.brandText}>Dropple</div>
                <div className={styles.brandDivider} />
                <div className={styles.brandPill}>Creative OS</div>
            </header>

            <div className={styles.topStatus} aria-hidden='true'>
                <div className={styles.worldStatus}>
                    <span className={styles.worldStatusLabel}>World Status</span>
                    <span className={styles.worldStatusDot} />
                    <span className={styles.worldStatusValue}>Alive</span>
                </div>
                <div className={styles.statusIcon}>◌</div>
                <div className={styles.statusIcon}>✦</div>
            </div>

            <section
                className={styles.hero}
                id='home'
                data-region-id='home'
                data-region-identity={REGION_IDENTITIES.home}
                data-active-region={activeRegionId === 'home' ? 'true' : 'false'}
                data-camera-relationship={resolveCameraRelationship('home', activeRegionId)}
            >
                <div className={styles.heroShell}>
                    <div className={styles.heroCopy}>
                        <div className={styles.eyebrow}>A creative operating system</div>
                        <h1
                            className={`${styles.heroTitle} ${styles.motionHeadline} ${styles.scrollReveal}`}
                            data-scroll-reveal
                        >
                            Begin where creation moves.
                        </h1>
                        <p
                            className={`${styles.heroBody} ${styles.motionCopy} ${styles.scrollReveal}`}
                            data-scroll-reveal
                            style={{ '--reveal-delay': '90ms' }}
                        >
                            Enter one continuous Dropple world, then choose the
                            creative language that matches how you want to think,
                            build, express, and release.
                        </p>
                        <div
                            className={`${styles.heroActions} ${styles.scrollReveal}`}
                            data-scroll-reveal
                            style={{ '--reveal-delay': '160ms' }}
                        >
                            <Link className={styles.primaryAction} href='/marketplace?entry=blueprint'>
                                Begin Creative Start
                            </Link>
                            <Link className={styles.secondaryAction} href={continueExistingWorkHref}>
                                Continue Existing Work
                            </Link>
                        </div>
                        <div
                            className={`${styles.heroMeta} ${styles.scrollReveal}`}
                            data-scroll-reveal
                            style={{ '--reveal-delay': '220ms' }}
                        >
                            <span>Motion first</span>
                            <span>Language organized</span>
                            <span>One living world</span>
                        </div>
                    </div>

                    <InteractiveSurface
                        className={`${styles.heroVisual} ${styles.interactiveSurface}`}
                        aria-hidden='true'
                    >
                        <div className={styles.heroVisualGlow} />
                        <div className={styles.heroSurfaceCore}>
                            <div className={styles.heroSurfaceToolbar}>
                                <span />
                                <span />
                                <span />
                            </div>
                            <div className={styles.heroSurfaceButton}>Create Account</div>
                        </div>
                        <div className={styles.heroFloatingCardA}>
                            <div className={styles.heroBadge}>AUTH FLOW</div>
                            <div className={styles.heroCardTitle}>Welcome Screen</div>
                            <div className={styles.heroTextList}>
                                <span>Greeting the creator</span>
                                <span>Choose a creative language</span>
                                <span>Move directly into the world</span>
                            </div>
                            <div className={styles.heroCardFooter}>
                                <span>State</span>
                                <strong>Ready</strong>
                            </div>
                        </div>
                        <div className={styles.heroFloatingCardB}>
                            <div className={styles.heroBadgeGreen}>PAYMENT FLOW</div>
                            <div className={styles.heroCardTitle}>Checkout Route</div>
                            <div className={styles.heroTextList}>
                                <span>Plan selection</span>
                                <span>Secure confirmation</span>
                                <span>Account activation</span>
                            </div>
                            <div className={styles.heroCardFooter}>
                                <span>Branch</span>
                                <strong>Live</strong>
                            </div>
                        </div>
                        <div className={styles.heroFloatingCardC}>
                            <div className={styles.heroBadgeWarm}>DATA MODEL</div>
                            <div className={styles.heroNodeRow}>
                                <span>User</span>
                                <span>Project</span>
                                <span>Team</span>
                            </div>
                            <div className={styles.heroModelLegend}>
                                <span>Entity graph</span>
                                <strong>Synced</strong>
                            </div>
                        </div>
                        <svg
                            className={styles.heroConnections}
                            viewBox='0 0 100 100'
                            preserveAspectRatio='none'
                        >
                            <path d='M 26 26 C 38 30, 44 38, 50 46' />
                            <path d='M 22 58 C 36 58, 44 58, 50 55' />
                            <path d='M 51 55 C 61 54, 70 50, 77 47' />
                            <path d='M 50 46 C 54 38, 58 32, 66 28' />
                            <path d='M 42 72 C 50 67, 56 67, 64 72' />
                        </svg>
                    </InteractiveSurface>
                </div>
            </section>

            {LANGUAGE_CHAPTERS.map((chapter, index) => (
                <section
                    key={chapter.id}
                    id={chapter.id}
                    className={styles.chapter}
                    data-region-id={chapter.id}
                    data-region-identity={REGION_IDENTITIES[chapter.id] ?? 'expressive'}
                    data-active-region={activeRegionId === chapter.id ? 'true' : 'false'}
                    data-camera-relationship={resolveCameraRelationship(chapter.id, activeRegionId)}
                    style={{
                        '--chapter-accent': chapter.accent,
                        '--chapter-accent-soft': chapter.accentSoft,
                        '--chapter-glow': chapter.glow,
                    }}
                >
                    <div
                        className={`${styles.chapterShell} ${
                            index % 2 === 1 ? styles.chapterShellReverse : ''
                        }`}
                    >
                        <div className={styles.chapterCopy}>
                            <div className={styles.sectionEyebrow}>{chapter.eyebrow}</div>
                            <h2
                                className={`${styles.chapterTitle} ${styles.motionHeadline} ${styles.scrollReveal}`}
                                data-scroll-reveal
                            >
                                {chapter.title}
                            </h2>
                            <p
                                className={`${styles.chapterBody} ${styles.motionCopy} ${styles.scrollReveal}`}
                                data-scroll-reveal
                                style={{ '--reveal-delay': '90ms' }}
                            >
                                {chapter.body}
                            </p>
                            <p className={styles.chapterServes}>{chapter.serves}</p>
                            <div
                                className={`${styles.chapterAtmosphere} ${styles.motionLabel} ${styles.scrollReveal}`}
                                data-scroll-reveal
                                style={{ '--reveal-delay': '140ms' }}
                            >
                                {chapter.atmosphere}
                            </div>
                            <InteractiveSurface
                                className={`${styles.languageCardDeck} ${styles.interactiveSurface} ${styles.scrollReveal}`}
                                data-scroll-reveal
                                style={{ '--reveal-delay': '180ms' }}
                            >
                                <div className={styles.languageDeckHeader}>
                                    <div className={styles.languageDeckWorkspace}>
                                        {chapter.workspaceLabel}
                                    </div>
                                    <div className={styles.languageDeckSummary}>
                                        {chapter.serves}
                                    </div>
                                </div>
                                <div className={styles.languageCardGrid}>
                                    {chapter.languages.map((language, languageIndex) => (
                                        <InteractiveSurface
                                            key={language.name}
                                            as={Link}
                                            href={language.href}
                                            className={`${styles.languageCard} ${styles.interactiveSurface}`}
                                            style={{
                                                '--card-delay': `${languageIndex * 90}ms`,
                                            }}
                                        >
                                            <div className={styles.languageIconWrap}>
                                                {(() => {
                                                    const Icon = LANGUAGE_ICONS[language.name];
                                                    return Icon ? (
                                                        <Icon className={styles.languageIconSvg} strokeWidth={1.8} />
                                                    ) : (
                                                        <span className={styles.languageIconCore} />
                                                    );
                                                })()}
                                            </div>
                                            <div className={`${styles.languageName} ${styles.motionLabel}`}>
                                                {language.name}
                                            </div>
                                            <p className={styles.languageBody}>{language.body}</p>
                                            <span className={styles.languageCta}>
                                                Enter {language.name}
                                            </span>
                                        </InteractiveSurface>
                                    ))}
                                </div>
                            </InteractiveSurface>
                        </div>

                        <ChapterVisual chapter={chapter} />
                    </div>
                </section>
            ))}

            <section className={styles.continueSection}>
                <div className={styles.continueShell}>
                    <div className={styles.continueIntro}>
                        <div className={styles.sectionEyebrow}>Continue Your Work</div>
                        <h2
                            className={`${styles.chapterTitle} ${styles.motionHeadline} ${styles.scrollReveal}`}
                            data-scroll-reveal
                        >
                            Return only after the world has shown you how creation is organized.
                        </h2>
                        <p
                            className={`${styles.chapterBody} ${styles.motionCopy} ${styles.scrollReveal}`}
                            data-scroll-reveal
                            style={{ '--reveal-delay': '90ms' }}
                        >
                            Dropple begins with creative language, then gently returns
                            you to recent work, blueprints, and templates.
                        </p>
                        <Link className={styles.primaryAction} href={continueExistingWorkHref}>
                            Continue Existing Work
                        </Link>
                    </div>

                    <div
                        className={`${styles.continueStack} ${styles.scrollReveal}`}
                        data-scroll-reveal
                        style={{ '--reveal-delay': '160ms' }}
                    >
                        <div className={styles.methodGrid}>
                            {STARTING_METHODS.map((method, index) => (
                                <InteractiveSurface
                                    key={method.title}
                                    as={Link}
                                    href={method.href}
                                    className={`${styles.methodCard} ${styles.interactiveSurface}`}
                                    style={{
                                        '--card-delay': `${index * 120}ms`,
                                        '--method-accent': method.accent,
                                        '--method-accent-soft': method.accentSoft,
                                    }}
                                >
                                    <div className={styles.methodIconWrap}>
                                        <method.icon
                                            className={styles.methodIconSvg}
                                            strokeWidth={1.8}
                                        />
                                    </div>
                                    <div className={styles.methodTitle}>{method.title}</div>
                                    <p className={styles.methodBody}>{method.body}</p>
                                    <span className={styles.methodCta}>{method.cta}</span>
                                </InteractiveSurface>
                            ))}
                        </div>

                        <div className={styles.trustSection}>
                            {TRUST_PILLARS.map((pillar, index) => (
                                <InteractiveSurface
                                    key={pillar}
                                    className={`${styles.trustCard} ${styles.interactiveSurface}`}
                                    style={{ '--card-delay': `${index * 120}ms` }}
                                >
                                    <div className={styles.trustGlyph} />
                                    <div className={styles.trustIndex}>0{index + 1}</div>
                                    <p className={styles.trustBody}>{pillar}</p>
                                </InteractiveSurface>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <footer className={styles.footer}>
                <div className={styles.footerGlow} />
                <div className={styles.footerTrustRow}>
                    {TRUST_PILLARS.map((pillar, index) => (
                        <div key={pillar} className={styles.footerTrustItem}>
                            <div className={styles.footerTrustIcon} />
                            <div>
                                <div className={styles.footerTrustTitle}>
                                    {index === 0
                                        ? 'One living world'
                                        : index === 1
                                          ? 'Motion-first thinking'
                                          : 'Language before tools'}
                                </div>
                                <div className={styles.footerTrustCopy}>{pillar}</div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className={styles.footerLinksPanel}>
                    {FOOTER_LINK_GROUPS.map((group) => (
                        <div key={group[0]} className={styles.footerLinkColumn}>
                            {group.map((item) => (
                                <span key={item} className={styles.footerLink}>
                                    {item}
                                </span>
                            ))}
                        </div>
                    ))}
                    <div className={styles.footerCopyright}>© Dropple</div>
                </div>
            </footer>
        </main>
    );
}
