import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
    runExportGateHeadless,
    exitCodeForStatus,
} from '../export/exportGateHeadless.js';

const args = parseArgs(process.argv.slice(2));

if (!args.world) {
    console.error('Missing --world <path>');
    process.exit(1);
}

const worldPath = resolve(process.cwd(), args.world);
let worldState;
try {
    const raw = readFileSync(worldPath, 'utf-8');
    worldState = JSON.parse(raw);
} catch (error) {
    console.error(`Failed to read world file: ${worldPath}`);
    console.error(error?.message || error);
    process.exit(1);
}

const width = Number.isFinite(args.width) ? args.width : undefined;
const height = Number.isFinite(args.height) ? args.height : undefined;
const maxIssues = Number.isFinite(args.maxIssues) ? args.maxIssues : undefined;
const annotate =
    args.annotate ??
    process.env.EXPORT_GATE_ANNOTATE ??
    'summary';

const { result, report, json } = runExportGateHeadless({
    worldState,
    width,
    height,
    maxIssues,
    strict: args.strict,
});

if (args.json) {
    console.log(JSON.stringify(json, null, 2));
} else {
    console.log(report);
}

if (!args.json && annotate === 'issues' && process.env.GITHUB_ACTIONS === 'true') {
    emitIssueAnnotations(result);
}

process.exit(exitCodeForStatus(result.status));

function parseArgs(list) {
    const output = {
        json: false,
        strict: false,
        annotate: 'summary',
        world: null,
        width: undefined,
        height: undefined,
        maxIssues: undefined,
    };

    for (let i = 0; i < list.length; i += 1) {
        const entry = list[i];
        switch (entry) {
            case '--json':
                output.json = true;
                break;
            case '--strict':
                output.strict = true;
                break;
            case '--annotate':
                output.annotate = list[i + 1] ?? 'summary';
                i += 1;
                break;
            case '--world':
                output.world = list[i + 1];
                i += 1;
                break;
            case '--width':
                output.width = Number(list[i + 1]);
                i += 1;
                break;
            case '--height':
                output.height = Number(list[i + 1]);
                i += 1;
                break;
            case '--max-issues':
                output.maxIssues = Number(list[i + 1]);
                i += 1;
                break;
            default:
                break;
        }
    }

    return output;
}

function emitIssueAnnotations(result) {
    const emit = (level, title, message) => {
        const safeTitle = escapeAnnotationValue(title);
        const safeMessage = escapeAnnotationValue(message);
        console.log(`::${level} title=${safeTitle}::${safeMessage}`);
    };

    (result.blockingIssues || []).forEach((issue) => {
        emit(
            'error',
            'Export UX error',
            formatIssueMessage(issue)
        );
    });

    (result.warnings || []).forEach((issue) => {
        emit(
            'warning',
            'Export UX warning',
            formatIssueMessage(issue)
        );
    });
}

function formatIssueMessage(issue) {
    const message = issue?.message || 'UX issue detected.';
    const rule = issue?.ruleId ? ` (${issue.ruleId})` : '';
    return `${message}${rule}`;
}

function escapeAnnotationValue(value) {
    return String(value)
        .replace(/%/g, '%25')
        .replace(/\r/g, '%0D')
        .replace(/\n/g, '%0A');
}
