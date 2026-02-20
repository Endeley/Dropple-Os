const DEFAULT_TAG = 'div';

const TYPE_TAG_MAP = {
    frame: 'section',
    section: 'section',
    text: 'p',
    button: 'button',
    image: 'img',
    header: 'header',
    footer: 'footer',
    main: 'main',
};

const ALLOWED_SEMANTIC_TAGS = new Set([
    'section',
    'header',
    'footer',
    'main',
    'button',
    'img',
    'p',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'div',
]);

export function buildStaticHTML(droppleSpec, options = {}) {
    const nodes = [...(droppleSpec.nodes ?? [])].sort(sortById);
    const edges = [...(droppleSpec.edges ?? [])].sort(sortEdges);
    const intent = options.intent || null;
    const enableSemanticTags = Boolean(options.enableSemanticTags);
    const enableIntentAttributes = Boolean(options.enableIntentAttributes);

    const childrenMap = new Map();
    for (const edge of edges) {
        if (edge.type !== 'parent') continue;
        if (!childrenMap.has(edge.from)) childrenMap.set(edge.from, []);
        childrenMap.get(edge.from).push(edge.to);
    }

    for (const [parentId, childIds] of childrenMap.entries()) {
        childrenMap.set(parentId, childIds.sort());
    }

    const nodeById = new Map(nodes.map((n) => [n.id, n]));

    const rootNodes = nodes.filter((n) => {
        for (const childIds of childrenMap.values()) {
            if (childIds.includes(n.id)) return false;
        }
        return true;
    });

    const body = rootNodes
        .map((n) =>
            renderNode(n, nodeById, childrenMap, 2, {
                intent,
                enableSemanticTags,
                enableIntentAttributes,
            })
        )
        .join('\n');

    return [
        '<!doctype html>',
        '<html lang="en">',
        '<head>',
        '  <meta charset="utf-8" />',
        '  <meta name="viewport" content="width=device-width, initial-scale=1" />',
        '  <title>Static Export</title>',
        '</head>',
        '<body>',
        '  <main>',
        body ? indent(body, 4) : '',
        '  </main>',
        '</body>',
        '</html>',
    ]
        .filter((line) => line !== '')
        .join('\n');
}

function renderNode(node, nodeById, childrenMap, indentLevel, options) {
    const tag = resolveTag(node, options);
    const attrs = buildAttributes(node, options);

    if (tag === 'img') {
        const alt = typeof node.props?.alt === 'string' ? node.props.alt : '';
        return `${' '.repeat(indentLevel)}<img${attrs}${
            alt ? ` alt="${escapeAttr(alt)}"` : ''
        } />`;
    }

    const content = node.props?.content;
    const childIds = childrenMap.get(node.id) || [];
    const children = childIds
        .map((childId) => nodeById.get(childId))
        .filter(Boolean)
        .map((child) => renderNode(child, nodeById, childrenMap, indentLevel + 2, options))
        .join('\n');

    if (children) {
        return [
            `${' '.repeat(indentLevel)}<${tag}${attrs}>`,
            children,
            `${' '.repeat(indentLevel)}</${tag}>`,
        ].join('\n');
    }

    if (content !== undefined) {
        return `${' '.repeat(indentLevel)}<${tag}${attrs}>${escapeText(
            String(content)
        )}</${tag}>`;
    }

    return `${' '.repeat(indentLevel)}<${tag}${attrs}></${tag}>`;
}

function resolveTag(node, options) {
    if (options?.enableSemanticTags) {
        const explicit = node?.props?.semanticTag;
        if (explicit) {
            const tag = String(explicit).toLowerCase();
            if (ALLOWED_SEMANTIC_TAGS.has(tag)) {
                return tag;
            }
        }
    }

    if (!node?.type) return DEFAULT_TAG;
    const key = String(node.type).toLowerCase();
    return TYPE_TAG_MAP[key] || DEFAULT_TAG;
}

function buildAttributes(node, options) {
    const parts = [`id="${node.id}"`];

    if (options?.enableIntentAttributes && options.intent) {
        const hasMotion = Boolean(options.intent.motion?.[node.id]);
        const hasInteraction = Boolean(options.intent.interaction?.[node.id]);

        if (hasMotion) {
            parts.push('data-intent-motion="true"');
        }
        if (hasInteraction) {
            parts.push('data-intent-interaction="true"');
        }
    }

    return parts.length ? ` ${parts.join(' ')}` : '';
}

function sortById(a, b) {
    return String(a.id).localeCompare(String(b.id));
}

function sortEdges(a, b) {
    if (a.type !== b.type) return String(a.type).localeCompare(String(b.type));
    if (a.from !== b.from) return String(a.from).localeCompare(String(b.from));
    return String(a.to).localeCompare(String(b.to));
}

function indent(str, spaces) {
    const pad = ' '.repeat(spaces);
    return str
        .split('\n')
        .map((line) => (line ? pad + line : line))
        .join('\n');
}

function escapeText(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function escapeAttr(text) {
    return escapeText(text).replace(/"/g, '&quot;');
}
