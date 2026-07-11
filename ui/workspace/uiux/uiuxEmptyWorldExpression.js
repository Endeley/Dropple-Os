import {
    hasProjectHistory,
    isCreateUiWorld,
} from '@/runtime/workspaces/projectSubstrateNavigation.js';
import { nanoid } from 'nanoid';

const EMPTY_WORLD_STARTERS = Object.freeze([
    Object.freeze({
        id: 'blankPage',
        label: 'Something new',
        title: 'Blank Page',
        description: 'Start from a flexible idea and let the structure appear as you shape it.',
        scenario: null,
        accent: 'violet',
    }),
    Object.freeze({
        id: 'landingPage',
        label: 'A public-facing experience',
        title: 'Landing Page',
        description: 'Bring a message, offer, or product story into a focused experience.',
        scenario: 'landingPage',
        accent: 'blue',
    }),
    Object.freeze({
        id: 'dashboard',
        label: 'An operations surface',
        title: 'Dashboard',
        description: 'Shape a place where people read signals, monitor activity, and act.',
        scenario: 'dashboard',
        accent: 'teal',
    }),
    Object.freeze({
        id: 'login',
        label: 'An access experience',
        title: 'Login Screen',
        description: 'Design the moment someone enters, verifies identity, or regains access.',
        scenario: 'login',
        accent: 'violet',
    }),
    Object.freeze({
        id: 'settings',
        label: 'A control surface',
        title: 'Settings Page',
        description: 'Give people a place to manage preferences, account rules, and system choices.',
        scenario: 'settings',
        accent: 'amber',
    }),
]);

function asStarter(starterId) {
    return EMPTY_WORLD_STARTERS.find((starter) => starter.id === starterId) ?? EMPTY_WORLD_STARTERS[0];
}

export function getUIUXEmptyWorldStarters() {
    return EMPTY_WORLD_STARTERS;
}

export function shouldShowUIUXEmptyWorld({
    workspaceId = null,
    modeId = null,
    nodeCount = 0,
    worldHistory = null,
} = {}) {
    if (!isCreateUiWorld({ workspaceId, modeId })) return false;
    return !hasProjectHistory({ workspaceId, modeId, nodeCount, worldHistory });
}

export function buildUIUXEmptyWorldCreateIntent(starterId = 'blankPage', options = null) {
    const starter = asStarter(starterId);
    const scenario = starter.scenario ?? null;
    const id =
        options && typeof options === 'object' && !Array.isArray(options)
            ? options.id ?? null
            : null;

    return Object.freeze({
        id,
        type: 'frame',
        name: starter.title,
        props: scenario
            ? Object.freeze({
                  scenario,
              })
            : undefined,
        metadata: Object.freeze({
            uiuxStarterId: starter.id,
            uiuxFirstExpression: true,
            ...(scenario ? { scenario } : {}),
        }),
    });
}

export function buildUIUXEmptyWorldSelectionIntent(nodeId) {
    if (typeof nodeId !== 'string' || nodeId.trim().length === 0) return null;

    return Object.freeze({
        ids: Object.freeze([nodeId]),
        primary: nodeId,
    });
}

export function buildUIUXEmptyWorldStarterActivation(starterId = 'blankPage') {
    const nodeId = `frame-${nanoid()}`;
    const createIntent = buildUIUXEmptyWorldCreateIntent(starterId, { id: nodeId });
    const selectionIntent = buildUIUXEmptyWorldSelectionIntent(nodeId);

    return Object.freeze({
        nodeId,
        createIntent,
        selectionIntent,
    });
}
