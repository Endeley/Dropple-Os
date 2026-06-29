import { resolveUIUXCreativeScenario } from './uiuxLanguageDictionary.js';

export const UIUX_SCENARIO_OPTIONS = Object.freeze([
    Object.freeze({ id: 'landingPage', label: 'Landing Page' }),
    Object.freeze({ id: 'dashboard', label: 'Dashboard' }),
    Object.freeze({ id: 'login', label: 'Login' }),
    Object.freeze({ id: 'settings', label: 'Settings' }),
]);

const EXPLICIT_SOURCE = 'explicit-user-selection';
const AI_SOURCE = 'ai-derived-intent';
const TEMPLATE_SOURCE = 'template';
const PROJECT_SOURCE = 'project-context';
const ARTIFACT_SOURCE = 'persisted-artifact-metadata';
const DEFAULT_SOURCE = 'default';

function asObject(value) {
    return value && typeof value === 'object' && !Array.isArray(value) ? value : null;
}

function firstResolvedScenario(candidates = []) {
    for (const candidate of candidates) {
        const resolved = resolveUIUXCreativeScenario(candidate);
        if (resolved) return resolved;
    }
    return null;
}

function resolveAiScenario(document, workspaceContext) {
    const meta = asObject(document?.meta);
    const assistantIntent = asObject(meta?.assistantIntent);
    const ai = asObject(meta?.ai);
    return firstResolvedScenario([
        assistantIntent?.scenario,
        assistantIntent?.creativeScenario,
        ai?.scenario,
        ai?.creativeScenario,
        workspaceContext?.assistantIntent?.scenario,
        workspaceContext?.aiScenario,
    ]);
}

function resolveTemplateScenario(document, workspaceContext) {
    const meta = asObject(document?.meta);
    const template = asObject(meta?.template);
    return firstResolvedScenario([
        template?.scenario,
        template?.creativeScenario,
        meta?.templateScenario,
        workspaceContext?.template?.scenario,
        workspaceContext?.templateScenario,
    ]);
}

function resolveProjectContextScenario(document, workspaceContext) {
    const meta = asObject(document?.meta);
    const projectContext = asObject(meta?.projectContext);
    return firstResolvedScenario([
        projectContext?.scenario,
        projectContext?.creativeScenario,
        workspaceContext?.projectContext?.scenario,
        workspaceContext?.projectContext?.creativeScenario,
        workspaceContext?.scenario,
    ]);
}

function resolveArtifactScenario(node) {
    return firstResolvedScenario([
        node?.metadata?.scenario,
        node?.metadata?.creativeScenario,
        node?.meta?.scenario,
        node?.meta?.creativeScenario,
        node?.scenario,
        node?.intent,
        node?.props?.scenario,
    ]);
}

export function resolveUIUXScenarioProvision({
    explicitScenario = null,
    node = null,
    document = null,
    workspaceContext = null,
} = {}) {
    const explicit = resolveUIUXCreativeScenario(explicitScenario);
    if (explicit) {
        return Object.freeze({
            scenario: explicit,
            source: EXPLICIT_SOURCE,
        });
    }

    const ai = resolveAiScenario(document, workspaceContext);
    if (ai) {
        return Object.freeze({
            scenario: ai,
            source: AI_SOURCE,
        });
    }

    const template = resolveTemplateScenario(document, workspaceContext);
    if (template) {
        return Object.freeze({
            scenario: template,
            source: TEMPLATE_SOURCE,
        });
    }

    const project = resolveProjectContextScenario(document, workspaceContext);
    if (project) {
        return Object.freeze({
            scenario: project,
            source: PROJECT_SOURCE,
        });
    }

    const artifact = resolveArtifactScenario(node);
    if (artifact) {
        return Object.freeze({
            scenario: artifact,
            source: ARTIFACT_SOURCE,
        });
    }

    return Object.freeze({
        scenario: null,
        source: DEFAULT_SOURCE,
    });
}

export function getUIUXScenarioSourceLabel(source) {
    switch (source) {
        case EXPLICIT_SOURCE:
            return 'Explicit selection';
        case AI_SOURCE:
            return 'AI-derived intent';
        case TEMPLATE_SOURCE:
            return 'Template';
        case PROJECT_SOURCE:
            return 'Project context';
        case ARTIFACT_SOURCE:
            return 'Artifact metadata';
        default:
            return 'Default';
    }
}
