import { validateUX } from '../ui/canvas/validation/validateUX.js';
import { evaluateExportGate } from './exportGate.js';
import { getZoomTier } from '../ui/canvas/zoomTiers.js';

const DEFAULT_SIZE = { width: 1440, height: 900 };
const DEFAULT_MAX_ISSUES = 10;

export function buildUXValidationInput({ worldState, width, height }) {
    if (!worldState) {
        throw new Error('Missing world state');
    }

    const camera = worldState.camera ?? worldState.viewport ?? {};
    const viewport = {
        x: camera.x ?? 0,
        y: camera.y ?? 0,
        scale: camera.scale ?? 1,
    };
    const screenSize = {
        width: Number.isFinite(width) ? width : DEFAULT_SIZE.width,
        height: Number.isFinite(height) ? height : DEFAULT_SIZE.height,
    };

    const nodes = Array.isArray(worldState.nodes)
        ? worldState.nodes
        : Object.values(worldState.nodesById || {});

    return {
        nodes,
        camera: viewport,
        viewportBounds: buildViewportBounds(viewport, screenSize),
        zoomTier: getZoomTier(viewport.scale),
    };
}

export function runExportGateHeadless({
    worldState,
    width,
    height,
    maxIssues,
    strict = false,
}) {
    const input = buildUXValidationInput({ worldState, width, height });
    const issues = validateUX(input);
    const result = evaluateExportGate(issues, { strict });
    const grouped = groupIssues(issues);
    const report = formatReport({ result, grouped, maxIssues });
    const json = formatJson({ result, grouped });

    return {
        input,
        issues,
        result,
        report,
        json,
    };
}

export function exitCodeForStatus(status) {
    if (status === 'allow') return 0;
    if (status === 'warn') return 2;
    return 1;
}

function buildViewportBounds(camera, surface) {
    const worldWidth = surface.width / camera.scale;
    const worldHeight = surface.height / camera.scale;

    return {
        minX: camera.x - worldWidth / 2,
        minY: camera.y - worldHeight / 2,
        maxX: camera.x + worldWidth / 2,
        maxY: camera.y + worldHeight / 2,
    };
}

function groupIssues(issues = []) {
    return {
        errors: issues.filter((issue) => issue?.severity === 'error'),
        warnings: issues.filter((issue) => issue?.severity === 'warning'),
        infos: issues.filter((issue) => issue?.severity === 'info'),
    };
}

function formatReport({ result, grouped, maxIssues = DEFAULT_MAX_ISSUES }) {
    const summary = result.summary || {};
    const lines = [];
    lines.push(`status: ${result.status}`);
    lines.push(
        `counts: errors ${summary.errorCount ?? 0}, warnings ${summary.warningCount ?? 0}, info ${summary.infoCount ?? 0}`
    );

    appendGroup(lines, 'errors', grouped.errors, maxIssues);
    appendGroup(lines, 'warnings', grouped.warnings, maxIssues);
    appendGroup(lines, 'info', grouped.infos, maxIssues);

    return lines.join('\n');
}

function appendGroup(lines, label, issues, maxIssues) {
    if (!issues.length) return;
    lines.push(`${label}:`);
    issues.slice(0, maxIssues).forEach((issue) => {
        const rule = issue?.ruleId ? `[${issue.ruleId}] ` : '';
        lines.push(`- ${rule}${issue?.message ?? 'Issue reported.'}`);
    });
    if (issues.length > maxIssues) {
        lines.push(`- +${issues.length - maxIssues} more`);
    }
}

function formatJson({ result, grouped }) {
    const toIssue = (issue) => ({
        ruleId: issue?.ruleId,
        message: issue?.message,
        affected: issue?.affected,
        explain: issue?.explain,
        severity: issue?.severity,
    });

    return {
        status: result.status,
        summary: result.summary,
        blockingIssues: (result.blockingIssues || []).map(toIssue),
        warnings: (result.warnings || []).map(toIssue),
        info: grouped.infos.map(toIssue),
    };
}
