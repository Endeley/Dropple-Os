import { listBlueprintCatalog } from '@/runtime/blueprints/blueprintCatalog.js';
import { buildBlueprintLaunchHref } from './blueprintLaunch.js';

function asNonEmptyString(value) {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
}

function tokenizeIntent(intent) {
    const normalized = asNonEmptyString(intent)?.toLowerCase() ?? null;
    if (!normalized) return Object.freeze([]);
    return Object.freeze(
        normalized
            .split(/[^a-z0-9]+/u)
            .map((token) => token.trim())
            .filter(Boolean),
    );
}

const INTENT_BLUEPRINT_MATCHERS = Object.freeze([
    Object.freeze({
        blueprintId: 'bp.logistics.v1',
        tokens: Object.freeze([
            'logistics',
            'delivery',
            'dispatch',
            'fleet',
            'transport',
            'shipping',
            'warehouse',
            'supply',
            'trucking',
            'operations',
        ]),
    }),
    Object.freeze({
        blueprintId: 'bp.startup.v2',
        tokens: Object.freeze([
            'startup',
            'brand',
            'website',
            'app',
            'application',
            'product',
            'saas',
            'launch',
            'company',
            'business',
        ]),
    }),
]);

export function resolveProjectIntentBlueprintRecommendations({
    intent = '',
    blueprints = listBlueprintCatalog(),
} = {}) {
    const tokens = tokenizeIntent(intent);
    if (tokens.length === 0 || !Array.isArray(blueprints)) return Object.freeze([]);

    const blueprintById = new Map(
        blueprints
            .filter((blueprint) => asNonEmptyString(blueprint?.id))
            .map((blueprint) => [blueprint.id, blueprint]),
    );

    const scored = INTENT_BLUEPRINT_MATCHERS.map((matcher) => {
        const blueprint = blueprintById.get(matcher.blueprintId) ?? null;
        if (!blueprint) return null;
        const score = matcher.tokens.reduce((total, token) => total + (tokens.includes(token) ? 1 : 0), 0);
        if (score === 0) return null;
        return Object.freeze({
            id: blueprint.id,
            name: asNonEmptyString(blueprint.name) ?? blueprint.id,
            description: asNonEmptyString(blueprint.description) ?? '',
            score,
        });
    })
        .filter(Boolean)
        .sort((left, right) => {
            if (left.score !== right.score) return right.score - left.score;
            return left.id.localeCompare(right.id);
        });

    return Object.freeze(scored);
}

export function buildProjectIntentRecommendationRoute(blueprintId) {
    const normalized = asNonEmptyString(blueprintId);
    return buildBlueprintLaunchHref({
        perspectiveId: 'create',
        blueprintId: normalized,
    });
}
