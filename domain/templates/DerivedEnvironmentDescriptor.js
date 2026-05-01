import crypto from 'crypto';

function isPlainObject(value) {
    return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function stableSerialize(value) {
    if (Array.isArray(value)) {
        return value.map((item) => stableSerialize(item));
    }

    if (isPlainObject(value)) {
        const result = {};
        for (const key of Object.keys(value).sort()) {
            result[key] = stableSerialize(value[key]);
        }
        return result;
    }

    return value;
}

function hashObject(value) {
    return crypto
        .createHash('sha256')
        .update(JSON.stringify(stableSerialize(value)))
        .digest('hex');
}

function deepFreeze(value) {
    if (!value || typeof value !== 'object' || Object.isFrozen(value)) {
        return value;
    }

    Object.freeze(value);

    if (Array.isArray(value)) {
        value.forEach((item) => deepFreeze(item));
        return value;
    }

    Object.values(value).forEach((item) => deepFreeze(item));
    return value;
}

function assertNonEmptyString(value, label) {
    if (typeof value !== 'string' || value.trim().length === 0) {
        throw new Error(`Derived environment descriptor ${label} must be a non-empty string`);
    }
}

function normalizeOptionalPlainObject(value, label) {
    if (value == null) return {};
    if (!isPlainObject(value)) {
        throw new Error(`Derived environment descriptor ${label} must be a plain object`);
    }
    return stableSerialize(value);
}

function normalizeOverrides(value = {}) {
    const normalized = normalizeOptionalPlainObject(value, 'environment.overrides');
    const result = {};

    if (normalized.tokens != null) {
        result.tokens = normalizeOptionalPlainObject(normalized.tokens, 'environment.overrides.tokens');
    }
    if (normalized.props != null) {
        result.props = normalizeOptionalPlainObject(normalized.props, 'environment.overrides.props');
    }
    if (normalized.inputs != null) {
        result.inputs = normalizeOptionalPlainObject(normalized.inputs, 'environment.overrides.inputs');
    }

    return stableSerialize(result);
}

function normalizeRuntimeConfig(value = {}) {
    const normalized = normalizeOptionalPlainObject(value, 'environment.runtimeConfig');
    const result = {};

    if (normalized.mode != null) {
        assertNonEmptyString(normalized.mode, 'environment.runtimeConfig.mode');
        result.mode = normalized.mode;
    }

    if (normalized.playback != null) {
        const playback = normalizeOptionalPlainObject(normalized.playback, 'environment.runtimeConfig.playback');
        const nextPlayback = {};
        if (playback.time != null) {
            if (typeof playback.time !== 'number' || !Number.isFinite(playback.time)) {
                throw new Error('Derived environment descriptor environment.runtimeConfig.playback.time must be a finite number');
            }
            nextPlayback.time = playback.time;
        }
        if (playback.paused != null) {
            if (typeof playback.paused !== 'boolean') {
                throw new Error('Derived environment descriptor environment.runtimeConfig.playback.paused must be a boolean');
            }
            nextPlayback.paused = playback.paused;
        }
        result.playback = stableSerialize(nextPlayback);
    }

    if (normalized.viewport != null) {
        const viewport = normalizeOptionalPlainObject(normalized.viewport, 'environment.runtimeConfig.viewport');
        const nextViewport = {};
        if (viewport.zoom != null) {
            if (typeof viewport.zoom !== 'number' || !Number.isFinite(viewport.zoom)) {
                throw new Error('Derived environment descriptor environment.runtimeConfig.viewport.zoom must be a finite number');
            }
            nextViewport.zoom = viewport.zoom;
        }
        if (viewport.offset != null) {
            const offset = normalizeOptionalPlainObject(viewport.offset, 'environment.runtimeConfig.viewport.offset');
            if (typeof offset.x !== 'number' || !Number.isFinite(offset.x)) {
                throw new Error('Derived environment descriptor environment.runtimeConfig.viewport.offset.x must be a finite number');
            }
            if (typeof offset.y !== 'number' || !Number.isFinite(offset.y)) {
                throw new Error('Derived environment descriptor environment.runtimeConfig.viewport.offset.y must be a finite number');
            }
            nextViewport.offset = {
                x: offset.x,
                y: offset.y,
            };
        }
        result.viewport = stableSerialize(nextViewport);
    }

    return stableSerialize(result);
}

function normalizeModeContext(value) {
    const normalized = normalizeOptionalPlainObject(value, 'environment.modeContext');
    assertNonEmptyString(normalized.workspaceId, 'environment.modeContext.workspaceId');
    assertNonEmptyString(normalized.modeId, 'environment.modeContext.modeId');

    const result = {
        workspaceId: normalized.workspaceId,
        modeId: normalized.modeId,
    };

    if (normalized.overlayId != null) {
        assertNonEmptyString(normalized.overlayId, 'environment.modeContext.overlayId');
        result.overlayId = normalized.overlayId;
    }

    return stableSerialize(result);
}

function normalizeLineage(value) {
    const normalized = normalizeOptionalPlainObject(value, 'lineage');
    assertNonEmptyString(normalized.lineageRootId, 'lineage.lineageRootId');
    assertNonEmptyString(normalized.versionId, 'lineage.versionId');

    return Object.freeze({
        lineageRootId: normalized.lineageRootId,
        versionId: normalized.versionId,
    });
}

function normalizeEnvironment(value = {}) {
    const normalized = normalizeOptionalPlainObject(value, 'environment');

    return stableSerialize({
        overrides: normalizeOverrides(normalized.overrides ?? {}),
        runtimeConfig: normalizeRuntimeConfig(normalized.runtimeConfig ?? {}),
        modeContext: normalizeModeContext(normalized.modeContext ?? {}),
    });
}

export function deriveDerivedEnvironmentId({
    lineage,
    environment,
}) {
    const normalizedLineage = normalizeLineage(lineage);
    const normalizedEnvironment = normalizeEnvironment(environment);

    return hashObject({
        lineage: normalizedLineage,
        environment: normalizedEnvironment,
    });
}

export function createDerivedEnvironmentDescriptor({
    environmentId,
    lineage,
    environment,
    metadata = {},
}) {
    const normalizedLineage = normalizeLineage(lineage);
    const normalizedEnvironment = normalizeEnvironment(environment);
    const normalizedMetadata = normalizeOptionalPlainObject(metadata, 'metadata');
    const derivedEnvironmentId = deriveDerivedEnvironmentId({
        lineage: normalizedLineage,
        environment: normalizedEnvironment,
    });

    if (environmentId != null && environmentId !== derivedEnvironmentId) {
        throw new Error(
            `Derived environment descriptor id mismatch: expected ${derivedEnvironmentId}, received ${environmentId}.`,
        );
    }

    return deepFreeze({
        environmentId: derivedEnvironmentId,
        lineage: normalizedLineage,
        environment: normalizedEnvironment,
        metadata: stableSerialize(normalizedMetadata),
    });
}
