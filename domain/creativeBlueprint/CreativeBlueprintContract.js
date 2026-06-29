function isPlainObject(value) {
    return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function asNonEmptyString(value, label) {
    if (typeof value !== 'string' || value.trim().length === 0) {
        throw new Error(`creative blueprint requires non-empty string field: ${label}`);
    }
    return value.trim();
}

function normalizeStructureEntry(entry, index) {
    if (!isPlainObject(entry)) {
        throw new Error(`creative blueprint structure entry at index ${index} must be an object`);
    }

    const type = asNonEmptyString(entry.type, `structure[${index}].type`);
    const id =
        typeof entry.id === 'string' && entry.id.trim().length > 0
            ? entry.id.trim()
            : `${type}:${index + 1}`;
    const label =
        typeof entry.label === 'string' && entry.label.trim().length > 0
            ? entry.label.trim()
            : null;

    return Object.freeze({
        id,
        type,
        ...(label ? { label } : {}),
    });
}

function normalizeRelationshipEntry(entry, index, knownIds) {
    if (!isPlainObject(entry)) {
        throw new Error(`creative blueprint relationship entry at index ${index} must be an object`);
    }

    const from = asNonEmptyString(entry.from, `relationships[${index}].from`);
    const to = asNonEmptyString(entry.to, `relationships[${index}].to`);

    if (!knownIds.has(from)) {
        throw new Error(`creative blueprint relationship references unknown source id: ${from}`);
    }
    if (!knownIds.has(to)) {
        throw new Error(`creative blueprint relationship references unknown target id: ${to}`);
    }

    return Object.freeze({ from, to });
}

export function validateCreativeBlueprintV1(blueprint) {
    if (!isPlainObject(blueprint)) {
        throw new Error('creative blueprint must be an object');
    }

    const world = asNonEmptyString(blueprint.world, 'world');
    const scenario = asNonEmptyString(blueprint.scenario, 'scenario');
    const purpose = asNonEmptyString(blueprint.purpose, 'purpose');

    if (!Array.isArray(blueprint.structure) || blueprint.structure.length === 0) {
        throw new Error('creative blueprint requires non-empty structure array');
    }

    const structure = blueprint.structure.map(normalizeStructureEntry);
    const knownIds = new Set(structure.map((entry) => entry.id));
    if (knownIds.size !== structure.length) {
        throw new Error('creative blueprint structure ids must be unique');
    }

    const relationships = Array.isArray(blueprint.relationships)
        ? blueprint.relationships.map((entry, index) => normalizeRelationshipEntry(entry, index, knownIds))
        : [];

    return Object.freeze({
        schemaVersion: '1.0.0',
        world,
        scenario,
        purpose,
        structure: Object.freeze(structure),
        relationships: Object.freeze(relationships),
    });
}
