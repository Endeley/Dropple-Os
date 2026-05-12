import { reconcileInterpretedToolVisibility } from '@/runtime/tools/reconcileInterpretedToolVisibility.js';

function emitEvent(emit, event) {
    if (typeof emit !== 'function' || !event) return;

    if (emit.length >= 2) {
        emit(event.type, event);
        return;
    }

    emit(event);
}

function normalizeProviders(providers) {
    if (!Array.isArray(providers)) return [];

    return providers
        .filter((provider) => typeof provider?.source === 'string' && provider.source.trim().length > 0)
        .map((provider) => ({
            source: provider.source.trim(),
            specs: Array.isArray(provider.specs) ? provider.specs : [],
            priority: Number.isFinite(provider.priority) ? provider.priority : 0,
        }))
        .sort((left, right) => {
            if (left.priority !== right.priority) {
                return right.priority - left.priority;
            }
            return left.source.localeCompare(right.source);
        });
}

export function createInterpretedToolProviderController({ emit } = {}) {
    let toolsBySource = Object.create(null);

    function sync({ providers, capabilitySet, allowedToolIds } = {}) {
        const nextProviders = normalizeProviders(providers);
        const nextSources = new Set(nextProviders.map((provider) => provider.source));

        for (const provider of nextProviders) {
            const currentTools = toolsBySource[provider.source] ?? [];
            const plan = reconcileInterpretedToolVisibility({
                source: provider.source,
                specs: provider.specs,
                capabilitySet,
                allowedToolIds,
                currentTools,
                priority: provider.priority,
            });

            if (plan.event) {
                emitEvent(emit, plan.event);
            }

            if (plan.nextTools.length > 0) {
                toolsBySource[provider.source] = [...plan.nextTools];
            } else {
                delete toolsBySource[provider.source];
            }
        }

        for (const source of Object.keys(toolsBySource)) {
            if (nextSources.has(source)) continue;

            const plan = reconcileInterpretedToolVisibility({
                source,
                specs: [],
                capabilitySet,
                allowedToolIds,
                currentTools: toolsBySource[source],
            });
            if (plan.event) {
                emitEvent(emit, plan.event);
            }
            delete toolsBySource[source];
        }

        return Object.freeze({
            toolsBySource: Object.freeze(
                Object.fromEntries(
                    Object.keys(toolsBySource)
                        .sort((left, right) => left.localeCompare(right))
                        .map((source) => [source, Object.freeze([...toolsBySource[source]])]),
                ),
            ),
        });
    }

    function dispose() {
        const sources = Object.keys(toolsBySource).sort((left, right) => left.localeCompare(right));

        for (const source of sources) {
            const plan = reconcileInterpretedToolVisibility({
                source,
                specs: [],
                currentTools: toolsBySource[source],
            });
            if (plan.event) {
                emitEvent(emit, plan.event);
            }
        }

        toolsBySource = Object.create(null);
    }

    return Object.freeze({
        sync,
        dispose,
    });
}
