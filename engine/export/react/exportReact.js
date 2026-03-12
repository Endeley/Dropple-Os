import { validateIR } from '../../ir/validateIR.js';
import { hashIR } from '../../ir/hashIR.js';

export function exportReact(ir) {
    validateIR(ir);

    const fingerprint = hashIR(ir);
    const scene = ir.scene ?? {};
    const nodes = scene.nodes ?? {};
    const ids = Object.keys(nodes).sort();

    let code = '';

    for (const id of ids) {
        code += compileNode(id, nodes[id]);
    }

    return {
        fingerprint,
        code,
    };
}

function compileNode(id, node) {
    switch (node.type) {
        case 'frame':
            return compileFrame(id, node);
        case 'text':
            return compileText(id, node);
        default:
            return '';
    }
}

function compileFrame(id, node) {
    const width = node.layout?.width ?? 0;
    const height = node.layout?.height ?? 0;

    return `<div id="${id}" style={{width:${width},height:${height}}}></div>\n`;
}

function compileText(id, node) {
    const text = node.text ?? '';

    return `<span id="${id}">${text}</span>\n`;
}
