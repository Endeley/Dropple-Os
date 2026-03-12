/**
 * IR Validation Gate
 *
 * Ensures Dropple IR is structurally valid before reaching compiler backends.
 */
export function validateIR(ir) {
    if (!ir || typeof ir !== 'object' || Array.isArray(ir)) {
        throw new Error('IR_VALIDATION_FAILED: IR must be an object');
    }

    const requiredSections = [
        'scene',
        'components',
        'motion',
        'interactions',
        'semantics',
        'state',
    ];

    for (const section of requiredSections) {
        if (!(section in ir)) {
            throw new Error(`IR_VALIDATION_FAILED: Missing IR section "${section}"`);
        }
    }

    validateScene(ir.scene);
    validateComponents(ir.components, ir.scene);

    return true;
}

function validateScene(scene) {
    if (!scene || typeof scene !== 'object' || Array.isArray(scene)) {
        throw new Error('IR_VALIDATION_FAILED: scene must be an object');
    }

    if (!scene.nodes || typeof scene.nodes !== 'object' || Array.isArray(scene.nodes)) {
        throw new Error('IR_VALIDATION_FAILED: scene.nodes missing');
    }

    const ids = Object.keys(scene.nodes);
    const sorted = [...ids].sort();

    if (ids.join('|') !== sorted.join('|')) {
        throw new Error('IR_VALIDATION_FAILED: scene node ids must be deterministic order');
    }

    for (const id of ids) {
        const node = scene.nodes[id];

        if (!node || typeof node !== 'object' || Array.isArray(node)) {
            throw new Error(`IR_VALIDATION_FAILED: node "${id}" must be an object`);
        }

        if (Object.values(node).some((value) => value === undefined)) {
            throw new Error(`IR_VALIDATION_FAILED: node "${id}" contains undefined values`);
        }

        if (!node.type) {
            throw new Error(`IR_VALIDATION_FAILED: node "${id}" missing type`);
        }

        const children = Array.isArray(node.children) ? node.children : [];
        for (const child of children) {
            if (!(child in scene.nodes)) {
                throw new Error(
                    `IR_VALIDATION_FAILED: node "${id}" references missing child "${child}"`,
                );
            }
        }
    }
}

function validateComponents(components, scene) {
    if (!components || typeof components !== 'object' || Array.isArray(components)) {
        throw new Error('IR_VALIDATION_FAILED: components must be an object');
    }

    const instances = components.instances;
    if (!instances || typeof instances !== 'object' || Array.isArray(instances)) return;

    for (const [id, instance] of Object.entries(instances)) {
        if (!instance || typeof instance !== 'object' || Array.isArray(instance)) {
            throw new Error(
                `IR_VALIDATION_FAILED: component instance "${id}" must be an object`,
            );
        }

        if (Object.values(instance).some((value) => value === undefined)) {
            throw new Error(
                `IR_VALIDATION_FAILED: component instance "${id}" contains undefined values`,
            );
        }

        if (!instance.componentId) {
            throw new Error(
                `IR_VALIDATION_FAILED: component instance "${id}" missing componentId`,
            );
        }

        if (instance.rootNodeId && !(instance.rootNodeId in (scene?.nodes ?? {}))) {
            throw new Error(
                `IR_VALIDATION_FAILED: component instance "${id}" references missing rootNodeId "${instance.rootNodeId}"`,
            );
        }
    }
}
