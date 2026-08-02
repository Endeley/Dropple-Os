'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import TemplateCard from '@/marketplace/TemplateCard';
import BlueprintCard from '@/marketplace/BlueprintCard';
import { useMarketplaceFilters } from '@/marketplace/useMarketplaceFilters';
import MarketplaceFilterBar from '@/marketplace/MarketplaceFilterBar';
import { filterTemplates } from '@/marketplace/filterTemplates';
import { collections } from '@/marketplace/collections';
import { BLUEPRINT_CATEGORIES } from '@/marketplace/blueprintCategories.js';
import { buildTemplateDetailLaunchHref } from '@/runtime/workspaces/index.js';
import {
  buildMarketplaceBlueprintLaunchHref,
  buildMarketplaceBlueprintTemplateLaunchHref,
} from '@/marketplace/marketplaceLaunch.js';
import {
  createMarketplaceResolutionSearchParams,
  resolveMarketplaceResolutionState,
} from '@/marketplace/marketplaceResolution.js';

const MODE_PRESENTATION = Object.freeze({
  uiux: {
    label: 'UI / UX',
    body: 'Interface systems, flows, and product structure.',
  },
  design: {
    label: 'Design',
    body: 'Visual systems, composition, and expressive surfaces.',
  },
  graphic: {
    label: 'Graphic',
    body: 'Campaigns, identity, and visual communication.',
  },
  document: {
    label: 'Document',
    body: 'Structured pages, editorial composition, and narrative layout.',
  },
  animation: {
    label: 'Animation',
    body: 'Motion, timing, transitions, and temporal scenes.',
  },
  video: {
    label: 'Video',
    body: 'Moving image, pacing, continuity, and cinematic sequences.',
  },
  audio: {
    label: 'Audio',
    body: 'Voice, sequence, rhythm, and listening experience.',
  },
  application: {
    label: 'Application',
    body: 'Interactive products, behavior, and executable structure.',
  },
  logic: {
    label: 'Logic',
    body: 'Rules, state, causality, and system reasoning.',
  },
  automation: {
    label: 'Automation',
    body: 'Triggers, transformations, and repeatable execution.',
  },
  tokens: {
    label: 'Tokens',
    body: 'Themes, scales, variables, and shared visual law.',
  },
  components: {
    label: 'Components',
    body: 'Reusable patterns, variants, and interface foundations.',
  },
  governance: {
    label: 'Governance',
    body: 'Versioning, standards, trust, and system integrity.',
  },
  review: {
    label: 'Review',
    body: 'Feedback, evaluation, and iteration in motion.',
  },
  knowledge: {
    label: 'Knowledge',
    body: 'Teaching, explanation, and structured understanding.',
  },
  production: {
    label: 'Production',
    body: 'Release, handoff, publishing, and operational readiness.',
  },
});

function toTitleCase(value) {
  return String(value || '')
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getModePresentation(modeId) {
  if (!modeId) {
    return {
      label: 'All creative families',
      body: 'Resolve the kind of creation you want before selecting structure.',
    };
  }

  return MODE_PRESENTATION[modeId] ?? {
    label: toTitleCase(modeId),
    body: 'A certified creative starting family inside the Dropple operating environment.',
  };
}

const ENTRY_PRESENTATION = Object.freeze({
  blueprint: {
    label: 'Blueprint path',
    title: 'Start from structure.',
    body: 'Blueprint answers what you are building. It defines the structural foundation before you choose how that structure should begin to look or feel.',
    actionLabel: 'Choose blueprint',
    emptyLabel: 'No blueprints found.',
    loadingLabel: 'Loading blueprints...',
  },
  template: {
    label: 'Template path',
    title: 'Start from expression.',
    body: 'Template answers how you want to begin expressing the work. It gives you a faster starting surface once you already know the structural direction.',
    actionLabel: 'Choose template',
    emptyLabel: 'No templates found.',
    loadingLabel: 'Loading templates...',
  },
});

function getEntryPresentation(entryIntent) {
  return ENTRY_PRESENTATION[entryIntent] ?? ENTRY_PRESENTATION.blueprint;
}

function getNextResolutionStep({
  entryIntent,
  filters,
  visibleCount,
  committedArtifact = null,
  expressionStrategy = null,
}) {
  if (filters.mode === 'all') {
    return {
      title: 'Resolve the creative family first.',
      body: 'Before Dropple can prepare a session, it needs to know which creative language family this work belongs to.',
      action: 'Choose a creative family below.',
    };
  }

  if (filters.category === 'all') {
    return {
      title: 'Resolve the blueprint category next.',
      body: 'The family is now known. Narrow the structural intent so the launch path knows what kind of thing you are building.',
      action: 'Choose one blueprint category to continue.',
    };
  }

  if (entryIntent === 'blueprint' && committedArtifact) {
    if (expressionStrategy === 'template') {
      return {
        title: 'Resolve the starting expression.',
        body: 'The structural foundation is already committed. The remaining decision is which compatible template should shape how this blueprint first appears.',
        action: 'Inspect and commit one compatible template, or switch to the blueprint native starting point.',
      };
    }

    return {
      title: 'Resolve the expression strategy.',
      body: 'The blueprint is committed. Decide whether to begin from the blueprint native expression or from a compatible template.',
      action: 'Choose one deliberate starting expression below.',
    };
  }

  if (visibleCount === 0) {
    return {
      title: 'No matching starting artifacts are currently visible.',
      body: 'The structural path is resolved, but the current search or browse filters are hiding every compatible result.',
      action: 'Broaden the secondary filters or search query.',
    };
  }

  return {
    title: entryIntent === 'template' ? 'Choose the starting expression.' : 'Choose the structural foundation.',
    body:
      entryIntent === 'template'
        ? 'The remaining job is to choose the concrete template that should carry this resolved path into the workspace.'
        : 'The remaining job is to choose the exact blueprint that should define the session before the workspace opens.',
    action: `Select one of the ${visibleCount} visible ${entryIntent === 'template' ? 'templates' : 'blueprints'}.`,
  };
}

export default function MarketplacePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resolutionState = useMemo(
    () => resolveMarketplaceResolutionState(searchParams),
    [searchParams],
  );
  const entryIntent = resolutionState.entryIntent;
  const initialFilters = useMemo(() => ({
    query: resolutionState.query,
    mode: resolutionState.mode,
    category: resolutionState.category,
  }), [resolutionState]);
  const filters = useMarketplaceFilters(initialFilters);
  const [records, setRecords] = useState([]);
  const [templateRecords, setTemplateRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadRecords() {
      setLoading(true);
      setError(null);

      try {
        const endpoint =
          entryIntent === 'template'
            ? '/api/templates/marketplace'
            : '/api/blueprints/marketplace';
        const response = await fetch(endpoint);
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload?.error ?? 'Failed to load marketplace records.');
        }

        if (!cancelled) {
          setRecords(
            entryIntent === 'template'
              ? Array.isArray(payload?.templates) ? payload.templates : []
              : Array.isArray(payload?.blueprints) ? payload.blueprints : [],
          );
        }
      } catch (nextError) {
        if (!cancelled) {
          setError(nextError);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadRecords();

    return () => {
      cancelled = true;
    };
  }, [entryIntent]);

  useEffect(() => {
    if (entryIntent !== 'blueprint') {
      setTemplateRecords([]);
      return;
    }

    let cancelled = false;

    async function loadTemplateRecords() {
      try {
        const response = await fetch('/api/templates/marketplace');
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload?.error ?? 'Failed to load templates.');
        }

        if (!cancelled) {
          setTemplateRecords(Array.isArray(payload?.templates) ? payload.templates : []);
        }
      } catch {
        if (!cancelled) {
          setTemplateRecords([]);
        }
      }
    }

    loadTemplateRecords();

    return () => {
      cancelled = true;
    };
  }, [entryIntent]);

  useEffect(() => {
    const nextParams = createMarketplaceResolutionSearchParams({
      entryIntent,
      query: filters.query,
      mode: filters.mode,
      category: filters.category,
      artifactId: resolutionState.artifactId,
      committed: resolutionState.committed,
      expressionStrategy: resolutionState.expressionStrategy,
      expressionTemplateId: resolutionState.expressionTemplateId,
      expressionCommitted: resolutionState.expressionCommitted,
    });
    const nextQuery = nextParams.toString();
    const currentQuery = searchParams.toString();

    if (nextQuery === currentQuery) {
      return;
    }

    const href = nextQuery.length > 0 ? `/marketplace?${nextQuery}` : '/marketplace';
    router.replace(href, { scroll: false });
  }, [
    entryIntent,
    filters.query,
    filters.mode,
    filters.category,
    resolutionState.artifactId,
    resolutionState.committed,
    resolutionState.expressionStrategy,
    resolutionState.expressionTemplateId,
    resolutionState.expressionCommitted,
    router,
    searchParams,
  ]);

  const visibleRecords = filterTemplates(records, filters);
  const committedArtifact = resolutionState.artifactId
    ? records.find((record) => record?.id === resolutionState.artifactId) ?? null
    : null;
  const compatibleTemplates = useMemo(() => {
    if (entryIntent !== 'blueprint' || !committedArtifact) return [];
    const committedModes = Array.isArray(committedArtifact?.modes)
      ? committedArtifact.modes
      : [committedArtifact?.mode].filter(Boolean);

    return templateRecords.filter((template) => {
      if (template?.blueprintCategory !== committedArtifact?.blueprintCategory) {
        return false;
      }
      if (committedModes.length === 0) return true;
      return committedModes.includes(template?.mode);
    });
  }, [committedArtifact, entryIntent, templateRecords]);
  const committedExpressionTemplate =
    resolutionState.expressionTemplateId
      ? compatibleTemplates.find((template) => template?.id === resolutionState.expressionTemplateId) ?? null
      : null;
  const modeOptions = useMemo(() => {
    const uniqueModes = [
      ...new Set(
        records.flatMap((record) => {
          const primaryMode =
            typeof record?.mode === 'string' && record.mode.length > 0 ? [record.mode] : [];
          const supportedModes = Array.isArray(record?.modes)
            ? record.modes.filter((modeId) => typeof modeId === 'string' && modeId.length > 0)
            : [];
          return [...primaryMode, ...supportedModes];
        }),
      ),
    ];

    return uniqueModes
      .sort((left, right) => left.localeCompare(right))
      .map((modeId) => ({
        id: modeId,
        ...getModePresentation(modeId),
      }));
  }, [records]);

  const categoryCards = BLUEPRINT_CATEGORIES.map((category) => ({
    ...category,
    count: records.filter((record) => {
      const modes = Array.isArray(record?.modes) ? record.modes : [];
      if (filters.mode !== 'all' && record?.mode !== filters.mode && !modes.includes(filters.mode)) return false;
      return record?.blueprintCategory === category.id;
    }).length,
  }));
  const selectedModePresentation = getModePresentation(filters.mode === 'all' ? null : filters.mode);
  const entryPresentation = getEntryPresentation(entryIntent);
  const committedArtifactLabel = committedArtifact?.metadata?.title ?? 'Pending selection';
  const launchReadiness =
    entryIntent === 'blueprint' && resolutionState.committed && committedArtifact
      ? resolutionState.expressionStrategy === 'default'
        ? {
            state: 'launch-ready',
            label: 'Launch Ready',
            body: 'The structural foundation is committed and the blueprint native expression has been selected explicitly.',
            action: 'Launch with blueprint native expression',
          }
        : resolutionState.expressionStrategy === 'template' && resolutionState.expressionCommitted && committedExpressionTemplate
          ? {
              state: 'launch-ready',
              label: 'Launch Ready',
              body: 'Structure and expression are both committed. The session can now launch with canonical blueprint truth and compatible template truth together.',
              action: 'Launch with blueprint + template',
            }
          : resolutionState.expressionStrategy === 'template'
            ? {
                state: 'partially-resolved',
                label: 'Partially Resolved',
                body: 'The blueprint is committed, but the compatible expression template has not been committed yet.',
                action: 'Choose and commit one compatible template, or select the blueprint native starting point.',
              }
            : {
                state: 'partially-resolved',
                label: 'Partially Resolved',
                body: 'The blueprint is committed. The remaining decision is how its expression should begin.',
                action: 'Choose the blueprint native starting point or open compatible templates.',
              }
      : resolutionState.committed && committedArtifact
      ? {
          state: 'launch-ready',
          label: 'Launch Ready',
          body:
            entryIntent === 'template'
              ? 'The starting expression is committed. This path can now delegate to the canonical Template Producer.'
              : 'The structural starting artifact is committed. You can continue now, or later refine the expression with a template.',
          action:
            entryIntent === 'template'
              ? 'Continue with Template Producer'
              : 'Continue with default expression',
        }
      : committedArtifact
        ? {
            state: 'partially-resolved',
            label: 'Partially Resolved',
            body: 'An artifact has been inspected, but it has not yet been committed as session truth.',
            action: 'Commit the artifact explicitly before launch.',
          }
        : {
            state: 'exploring',
            label: 'Exploring',
            body: 'No starting artifact has been committed yet. Marketplace is still resolving the creative session.',
            action: 'Inspect an artifact, then commit it deliberately.',
          };
  const nextStep = getNextResolutionStep({
    entryIntent,
    filters,
    visibleCount: visibleRecords.length,
    committedArtifact,
    expressionStrategy: resolutionState.expressionStrategy,
  });
  const resolutionStatus = [
    {
      id: 'entry',
      label: 'Entry strategy',
      value: entryIntent === 'template' ? 'Template first' : 'Blueprint first',
      resolved: true,
    },
    {
      id: 'language',
      label: 'Creative family',
      value: filters.mode === 'all' ? 'Unresolved' : selectedModePresentation.label,
      resolved: filters.mode !== 'all',
    },
    {
      id: 'category',
      label: 'Blueprint category',
      value:
        filters.category === 'all'
          ? 'Unresolved'
          : BLUEPRINT_CATEGORIES.find((category) => category.id === filters.category)?.label ?? filters.category,
      resolved: filters.category !== 'all',
    },
    {
      id: 'artifact',
      label: entryIntent === 'template' ? 'Template choice' : 'Blueprint choice',
      value: committedArtifactLabel,
      resolved: Boolean(resolutionState.committed && committedArtifact),
    },
  ];
  const expressionStatus =
    entryIntent !== 'blueprint'
      ? null
      : resolutionState.expressionStrategy === 'default'
        ? {
            value: 'Blueprint native expression',
            resolved: true,
          }
        : resolutionState.expressionStrategy === 'template' && resolutionState.expressionCommitted && committedExpressionTemplate
          ? {
              value: committedExpressionTemplate?.metadata?.title ?? 'Compatible template committed',
              resolved: true,
            }
          : resolutionState.expressionStrategy === 'template'
            ? {
                value: committedExpressionTemplate?.metadata?.title ?? 'Compatible template pending commitment',
                resolved: false,
              }
            : {
                value: 'Unresolved',
                resolved: false,
              };
  const resolvedCount =
    resolutionStatus.filter((item) => item.resolved).length +
    (entryIntent === 'blueprint' && committedArtifact && expressionStatus?.resolved ? 1 : 0);
  const totalResolutionDecisions =
    resolutionStatus.length + (entryIntent === 'blueprint' && committedArtifact ? 1 : 0);
  const ambiguityLabel =
    entryIntent === 'template'
      ? 'The remaining ambiguity is which starting expression should carry this session into the workspace.'
      : committedArtifact
        ? 'The structural foundation is already resolved. The remaining ambiguity is which starting expression should carry that structure into the workspace.'
        : 'The remaining ambiguity is which structural foundation should carry this session into the workspace.';

  function openBlueprint(blueprint) {
    const params = createMarketplaceResolutionSearchParams({
      entryIntent,
      query: filters.query,
      mode: filters.mode,
      category: filters.category,
      artifactId: resolutionState.artifactId,
      committed: resolutionState.committed,
      expressionStrategy: resolutionState.expressionStrategy,
      expressionTemplateId: resolutionState.expressionTemplateId,
      expressionCommitted: resolutionState.expressionCommitted,
    });
    const query = params.toString();
    router.push(`/marketplace/blueprint/${blueprint.id}${query.length > 0 ? `?${query}` : ''}`);
  }

  function openTemplate(template) {
    const params = createMarketplaceResolutionSearchParams({
      entryIntent,
      query: filters.query,
      mode: filters.mode,
      category: filters.category,
      artifactId: resolutionState.artifactId,
      committed: resolutionState.committed,
      expressionStrategy: entryIntent === 'blueprint' ? 'template' : resolutionState.expressionStrategy,
      expressionTemplateId: entryIntent === 'blueprint' ? template.id : resolutionState.expressionTemplateId,
      expressionCommitted: false,
    });
    const query = params.toString();
    const path = `/marketplace/template/${template.id}`;
    router.push(`${path}${query.length > 0 ? `?${query}` : ''}`);
  }

  function clearCommittedArtifact() {
    const params = createMarketplaceResolutionSearchParams({
      entryIntent,
      query: filters.query,
      mode: filters.mode,
      category: filters.category,
    });
    const query = params.toString();
    router.push(query.length > 0 ? `/marketplace?${query}` : '/marketplace');
  }

  function continueCommittedArtifact() {
    if (!committedArtifact || !resolutionState.committed) return;
    const href =
      entryIntent === 'template'
        ? buildTemplateDetailLaunchHref(committedArtifact)
        : resolutionState.expressionStrategy === 'template' && resolutionState.expressionCommitted && committedExpressionTemplate
          ? buildMarketplaceBlueprintTemplateLaunchHref({
              blueprint: committedArtifact,
              template: committedExpressionTemplate,
            })
          : resolutionState.expressionStrategy === 'default'
            ? buildMarketplaceBlueprintLaunchHref({
                blueprint: committedArtifact,
              })
            : '/workspace/create';
    if (href === '/workspace/create') return;
    router.push(href);
  }

  function selectDefaultExpression() {
    if (!committedArtifact || entryIntent !== 'blueprint') return;
    const params = createMarketplaceResolutionSearchParams({
      entryIntent,
      query: filters.query,
      mode: filters.mode,
      category: filters.category,
      artifactId: committedArtifact.id,
      committed: true,
      expressionStrategy: 'default',
    });
    const query = params.toString();
    router.push(`/marketplace${query.length > 0 ? `?${query}` : ''}`);
  }

  const expressionChoices =
    entryIntent === 'blueprint' && committedArtifact
      ? [
          {
            id: 'default',
            title: 'Blueprint native expression',
            body: 'Begin from the blueprint’s own native starting point. This keeps structure and initial expression aligned to the blueprint itself.',
            selected: resolutionState.expressionStrategy === 'default',
            action: selectDefaultExpression,
          },
          {
            id: 'template',
            title: 'Compatible template',
            body: 'Apply a compatible expressive starting surface after structure is already resolved. Use this when you want the same blueprint to begin with a different feel.',
            selected: resolutionState.expressionStrategy === 'template',
            action: chooseTemplateExpression,
          },
        ]
      : [];

  function chooseTemplateExpression() {
    if (!committedArtifact || entryIntent !== 'blueprint') return;
    const params = createMarketplaceResolutionSearchParams({
      entryIntent,
      query: filters.query,
      mode: filters.mode,
      category: filters.category,
      artifactId: committedArtifact.id,
      committed: true,
      expressionStrategy: 'template',
    });
    const query = params.toString();
    router.push(`/marketplace${query.length > 0 ? `?${query}` : ''}`);
  }

  return (
    <div style={{ padding: 'var(--space-6)' }}>
      <div
        style={{
          display: 'grid',
          gap: 'var(--space-md)',
          marginBottom: 'var(--space-5)',
          maxWidth: 920,
        }}
      >
        <div
          style={{
            fontSize: 12,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
          }}
        >
          Creative Start 1.0
        </div>
        <div style={{ display: 'grid', gap: 'var(--space-sm)' }}>
          <h2 style={{ fontSize: 40, lineHeight: 1.05, margin: 0 }}>
            Resolve your starting point before entering the canvas.
          </h2>
          <p style={{ margin: 0, fontSize: 15, color: 'var(--text-muted)', maxWidth: 760 }}>
            Dropple does not begin with a blank editor by default. Resolve the kind
            of start you need first, then enter the workspace with a deliberate
            structural or expressive foundation.
          </p>
        </div>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 'var(--space-sm)',
          }}
        >
            {[
              { id: 'language', label: filters.mode === 'all' ? 'Choose family' : selectedModePresentation.label },
              { id: 'category', label: filters.category === 'all' ? 'Choose category' : BLUEPRINT_CATEGORIES.find((category) => category.id === filters.category)?.label ?? filters.category },
              {
                id: 'artifact',
                label:
                  entryIntent === 'template'
                    ? `${visibleRecords.length} templates`
                    : `${visibleRecords.length} blueprints`,
              },
              { id: 'workspace', label: 'Launch into workspace' },
            ].map((step, index) => (
            <div
              key={step.id}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 'var(--space-xs)',
                padding: '10px 14px',
                borderRadius: 999,
                border: '1px solid var(--border-default)',
                background: 'var(--surface-1)',
                fontSize: 12,
              }}
            >
              <span style={{ color: 'var(--text-muted)' }}>{index + 1}.</span>
              <span>{step.label}</span>
            </div>
          ))}
        </div>
      </div>

      <MarketplaceFilterBar
        {...filters}
        entryIntent={entryIntent}
        modeOptions={modeOptions}
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) minmax(320px, 0.8fr)',
          gap: 'var(--space-md)',
          marginBottom: 'var(--space-4)',
        }}
      >
        <div
          style={{
            display: 'grid',
            gap: 'var(--space-sm)',
            padding: 'var(--space-4)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-lg)',
            background: 'var(--surface-1)',
          }}
        >
          <div style={{ fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Next decision
          </div>
          <div style={{ fontSize: 22, fontWeight: 600 }}>{nextStep.title}</div>
          <div style={{ fontSize: 14, color: 'var(--text-muted)', maxWidth: 720 }}>
            {nextStep.body}
          </div>
          <div style={{ fontSize: 13, color: 'var(--color-primary)' }}>{nextStep.action}</div>
        </div>
        <div
          style={{
            display: 'grid',
            gap: 'var(--space-sm)',
            padding: 'var(--space-4)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-lg)',
            background: 'var(--surface-1)',
            alignContent: 'start',
          }}
        >
          <div style={{ fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Launch readiness
          </div>
          <div style={{ fontSize: 22, fontWeight: 600 }}>{launchReadiness.label}</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            {launchReadiness.body}
          </div>
          <div style={{ fontSize: 13, color: 'var(--color-primary)' }}>
            {launchReadiness.action}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {resolvedCount}/{totalResolutionDecisions} explicit resolution decisions.
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.2fr) minmax(320px, 0.8fr)',
          gap: 'var(--space-md)',
          marginBottom: 'var(--space-4)',
        }}
      >
        <div style={{ fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
          Resolution state
        </div>
        <div />
        <div
          style={{
            display: 'grid',
            gap: 'var(--space-sm)',
            padding: 'var(--space-4)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-lg)',
            background: 'var(--surface-1)',
          }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
            <Link
              href="/marketplace?entry=blueprint"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 40,
                padding: '0 16px',
                borderRadius: 999,
                border: `1px solid ${entryIntent === 'blueprint' ? 'var(--color-primary)' : 'var(--border-default)'}`,
                background: entryIntent === 'blueprint' ? 'rgba(123, 92, 255, 0.14)' : 'var(--surface-0)',
                color: 'inherit',
                textDecoration: 'none',
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              Blueprint
            </Link>
            <Link
              href="/marketplace?entry=template"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 40,
                padding: '0 16px',
                borderRadius: 999,
                border: `1px solid ${entryIntent === 'template' ? 'var(--color-primary)' : 'var(--border-default)'}`,
                background: entryIntent === 'template' ? 'rgba(123, 92, 255, 0.14)' : 'var(--surface-0)',
                color: 'inherit',
                textDecoration: 'none',
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              Template
            </Link>
          </div>
          <div style={{ fontSize: 24, fontWeight: 600 }}>
            {entryPresentation.title} {selectedModePresentation.label}
          </div>
          <div style={{ maxWidth: 760, color: 'var(--text-muted)', fontSize: 14 }}>
            {entryPresentation.body} {selectedModePresentation.body}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            {resolvedCount}/{totalResolutionDecisions} resolution decisions currently explicit.
          </div>
        </div>
        <div
          style={{
            display: 'grid',
            gap: 'var(--space-sm)',
            padding: 'var(--space-4)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-lg)',
            background: 'var(--surface-1)',
            alignContent: 'start',
          }}
        >
          <div style={{ fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Creator distinction
          </div>
          <div style={{ display: 'grid', gap: 'var(--space-sm)' }}>
            {resolutionStatus.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'grid',
                  gap: 2,
                  paddingBottom: 'var(--space-xs)',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 'var(--space-sm)',
                    fontSize: 13,
                  }}
                >
                  <span style={{ fontWeight: 600 }}>{item.label}</span>
                  <span style={{ color: item.resolved ? 'var(--color-primary)' : 'var(--text-muted)' }}>
                    {item.resolved ? 'Resolved' : 'Pending'}
                  </span>
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{item.value}</div>
              </div>
            ))}
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              {ambiguityLabel}
            </div>
            {entryIntent === 'blueprint' && committedArtifact ? (
              <div
                style={{
                  display: 'grid',
                  gap: 'var(--space-xs)',
                  paddingTop: 'var(--space-xs)',
                  borderTop: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 'var(--space-sm)',
                    fontSize: 13,
                  }}
                >
                  <span style={{ fontWeight: 600 }}>Expression resolution</span>
                  <span style={{ color: expressionStatus?.resolved ? 'var(--color-primary)' : 'var(--text-muted)' }}>
                    {expressionStatus?.resolved ? 'Resolved' : 'Pending'}
                  </span>
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  {expressionStatus?.value}
                </div>
                <div style={{ display: 'grid', gap: 'var(--space-sm)' }}>
                  {expressionChoices.map((choice) => (
                    <button
                      key={choice.id}
                      type="button"
                      onClick={choice.action}
                      style={{
                        display: 'grid',
                        gap: 4,
                        textAlign: 'left',
                        minHeight: 72,
                        padding: '12px 14px',
                        borderRadius: 'var(--radius-md)',
                        border: choice.selected
                          ? '1px solid var(--color-primary)'
                          : '1px solid var(--border-default)',
                        background: choice.selected
                          ? 'rgba(123, 92, 255, 0.14)'
                          : 'var(--surface-0)',
                        color: 'inherit',
                        cursor: 'pointer',
                      }}
                    >
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{choice.title}</span>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{choice.body}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
            {committedArtifact ? (
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 'var(--space-sm)',
                  paddingTop: 'var(--space-xs)',
                }}
              >
                <button
                  type="button"
                  onClick={clearCommittedArtifact}
                  style={{
                    minHeight: 36,
                    padding: '0 14px',
                    borderRadius: 999,
                    border: '1px solid var(--border-default)',
                    background: 'var(--surface-0)',
                    color: 'inherit',
                    fontSize: 12,
                    cursor: 'pointer',
                  }}
                >
                  Clear commitment
                </button>
                {resolutionState.committed && launchReadiness.state === 'launch-ready' ? (
                  <button
                    type="button"
                    onClick={continueCommittedArtifact}
                    style={{
                      minHeight: 36,
                      padding: '0 14px',
                      borderRadius: 999,
                      border: '1px solid var(--color-primary)',
                      background: 'rgba(123, 92, 255, 0.14)',
                      color: 'inherit',
                      fontSize: 12,
                      cursor: 'pointer',
                    }}
                  >
                    {launchReadiness.action}
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <h3 style={{ marginTop: 'var(--space-4)' }}>Creative Families</h3>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: 'var(--space-3)',
          marginTop: 'var(--space-2)',
        }}
      >
        {modeOptions.map((option) => {
          const selected = filters.mode === option.id;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => {
                filters.setMode((current) => (current === option.id ? 'all' : option.id));
                if (filters.category !== 'all') {
                  filters.setCategory('all');
                }
              }}
              style={{
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-3)',
                background: 'var(--surface-1)',
                textAlign: 'left',
                cursor: 'pointer',
                color: 'inherit',
                boxShadow: selected ? '0 0 0 1px var(--color-primary) inset' : 'none',
                display: 'grid',
                gap: 'var(--space-xs)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-sm)' }}>
                <span style={{ fontWeight: 600 }}>{option.label}</span>
                <span style={{ fontSize: 12, color: selected ? 'var(--color-primary)' : 'var(--text-muted)' }}>
                  {selected ? 'Resolved' : 'Select'}
                </span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{option.body}</div>
            </button>
          );
        })}
      </div>

      <h3 style={{ marginTop: 'var(--space-4)' }}>
        {entryIntent === 'template' ? 'Template-compatible Blueprint Categories' : 'Blueprint Categories'}
      </h3>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: 'var(--space-3)',
          marginTop: 'var(--space-2)',
        }}
      >
        {categoryCards.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => {
              filters.setCategory((current) => (current === category.id ? 'all' : category.id));
            }}
            style={{
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-3)',
              background: 'var(--surface-1)',
              fontSize: 13,
              textAlign: 'left',
              cursor: 'pointer',
              color: 'inherit',
              boxShadow:
                filters.category === category.id
                  ? '0 0 0 1px var(--color-primary) inset'
                  : 'none',
              display: 'grid',
              gap: 'var(--space-xs)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-sm)' }}>
              <span style={{ fontWeight: 600 }}>{category.label}</span>
              <span
                style={{
                  fontSize: 12,
                  color:
                    filters.category === category.id
                      ? 'var(--color-primary)'
                      : 'var(--text-muted)',
                }}
              >
                {filters.category === category.id ? 'Resolved' : 'Select'}
              </span>
            </div>
            <div style={{ marginTop: 'var(--space-xs)', color: 'var(--text-muted)' }}>
              {category.count} {entryIntent === 'template' ? 'templates' : 'blueprints'}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {entryIntent === 'template'
                ? 'Choose the structural category that this template should inherit.'
                : 'Choose the structural category that should define the workspace start.'}
            </div>
          </button>
        ))}
      </div>

      {entryIntent === 'blueprint' && committedArtifact && resolutionState.expressionStrategy === 'template' ? (
        <>
          <h3 style={{ marginTop: 'var(--space-4)' }}>Compatible Templates</h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: 'var(--space-4)',
              marginTop: 'var(--space-2)',
            }}
          >
            {compatibleTemplates.length ? (
              compatibleTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  entryIntent="template"
                  onOpen={openTemplate}
                />
              ))
            ) : (
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                No compatible templates are currently available for this blueprint family and category.
              </div>
            )}
          </div>
        </>
      ) : null}

      <h3 style={{ marginTop: 'var(--space-4)' }}>
        {entryIntent === 'template' ? 'Template Collections' : 'Blueprint Collections'}
      </h3>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: 'var(--space-3)',
          marginTop: 'var(--space-2)',
        }}
      >
        {collections.map((collection) => (
          <div
            key={collection.id}
            style={{
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-3)',
              background: 'var(--surface-1)',
              fontSize: 13,
            }}
          >
            <div style={{ fontWeight: 600 }}>{collection.title}</div>
            <div style={{ marginTop: 'var(--space-xs)', color: 'var(--text-muted)' }}>
              {collection.templateIds.length} {entryIntent === 'template' ? 'templates' : 'blueprints'}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: 'var(--space-4)',
          marginTop: 'var(--space-4)',
        }}
      >
        <div
          style={{
            gridColumn: '1 / -1',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 'var(--space-md)',
            flexWrap: 'wrap',
          }}
        >
          <h3 style={{ margin: 0 }}>{entryPresentation.actionLabel}</h3>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {visibleRecords.length} visible result{visibleRecords.length === 1 ? '' : 's'}
          </div>
        </div>
        {loading ? (
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{entryPresentation.loadingLabel}</div>
        ) : error ? (
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Failed to load {entryIntent === 'template' ? 'templates' : 'blueprints'}.
          </div>
        ) : visibleRecords.length ? (
          visibleRecords.map((tpl) => (
            entryIntent === 'template' ? (
              <TemplateCard
                key={tpl.id}
                template={tpl}
                entryIntent={entryIntent}
                onOpen={openTemplate}
              />
            ) : (
              <BlueprintCard
                key={tpl.id}
                blueprint={tpl}
                onOpen={openBlueprint}
              />
            )
          ))
        ) : (
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            {entryPresentation.emptyLabel}
          </div>
        )}
      </div>
    </div>
  );
}
