import {
    hasProjectHistory,
    isCreateUiWorld,
} from '@/runtime/workspaces/projectSubstrateNavigation.js';
import { nanoid } from 'nanoid';

const EMPTY_WORLD_STARTERS = Object.freeze([
    Object.freeze({
        id: 'blankPage',
        label: 'Blank Page',
        title: 'Blank Page',
        description: 'Start from scratch and build anything.',
        scenario: null,
        accent: 'violet',
    }),
    Object.freeze({
        id: 'landingPage',
        label: 'Landing Page',
        title: 'Landing Page',
        description: 'Create a marketing landing page.',
        scenario: 'landingPage',
        accent: 'blue',
    }),
    Object.freeze({
        id: 'dashboard',
        label: 'Dashboard',
        title: 'Dashboard',
        description: 'Build a data dashboard.',
        scenario: 'dashboard',
        accent: 'teal',
    }),
    Object.freeze({
        id: 'login',
        label: 'Login Screen',
        title: 'Login Screen',
        description: 'Design an authentication experience.',
        scenario: 'login',
        accent: 'violet',
    }),
    Object.freeze({
        id: 'settings',
        label: 'Settings Page',
        title: 'Settings Page',
        description: 'Create a settings or preferences page.',
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
        metadata: scenario
            ? Object.freeze({
                  scenario,
              })
            : undefined,
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
