import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const REGISTRY_DIR = path.join(ROOT, 'workspaces', 'registry');
const INDEX_PATH = path.join(REGISTRY_DIR, 'index.js');

function toSafeId(input) {
    return String(input)
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9-_]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^[-_]+|[-_]+$/g, '');
}

function toPascalCase(input) {
    return String(input)
        .split(/[-_\s]+/)
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join('');
}

const rawName = process.argv[2];
if (!rawName) {
    console.error('Usage: npm run create:workspace <name>');
    process.exit(1);
}

const id = toSafeId(rawName);
if (!id) {
    console.error('Invalid workspace name.');
    process.exit(1);
}

const constName = `${toPascalCase(id)}Workspace`;
const fileName = `${id}Workspace.js`;
const filePath = path.join(REGISTRY_DIR, fileName);

if (fs.existsSync(filePath)) {
    console.error(`Workspace already exists: ${fileName}`);
    process.exit(1);
}

const template = `// ${fileName}
// This workspace must obey Dropple Constitutional Law (see docs/LAW.md)

export const ${constName} = {
    id: "${id}",
    label: "${toPascalCase(id)}",
    status: "active",

    engines: [],
    tools: [],
    panels: [],

    capabilities: {
        canvas: false,
        timeline: false,
        animation: false,
        audio: false,
        video: false,
        codegen: false,
    },

    allowedEventTypes: [],
    timeline: null,

    export: null,
};
`;

fs.writeFileSync(filePath, template, 'utf8');

if (!fs.existsSync(INDEX_PATH)) {
    console.warn('Registry index not found. Skipping index update.');
    process.exit(0);
}

const indexContent = fs.readFileSync(INDEX_PATH, 'utf8');
const importLine = `import { ${constName} } from './${id}Workspace';`;

let nextContent = indexContent;
if (!indexContent.includes(importLine)) {
    const lines = indexContent.split('\n');
    let lastImportIndex = -1;
    for (let i = 0; i < lines.length; i += 1) {
        if (lines[i].startsWith('import ')) lastImportIndex = i;
    }
    lines.splice(lastImportIndex + 1, 0, importLine);
    nextContent = lines.join('\n');
}

if (!nextContent.includes(`${id}: ${constName}`)) {
    nextContent = nextContent.replace(
        /export const WorkspaceRegistry = \{([\s\S]*?)\n\};/,
        (match, body) => {
            const trimmed = body.replace(/\s+$/g, '');
            const entry = `\n    ${id}: ${constName},`;
            return `export const WorkspaceRegistry = {${trimmed}${entry}\n};`;
        }
    );
}

fs.writeFileSync(INDEX_PATH, nextContent, 'utf8');

console.log(`Created workspace: ${fileName}`);
console.log('Updated workspaces/registry/index.js');
