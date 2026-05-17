import fs from 'node:fs';
import { buildReleaseTrustSummary } from './releaseTrustSummary.mjs';

export const RELEASE_TRUST_COMMENT_MARKER = '<!-- release-trust-summary -->';

function assertEnv(name) {
    const value = process.env[name];
    if (!value || !String(value).trim()) {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return String(value).trim();
}

function parseRepo(value) {
    const [owner, repo] = String(value).split('/');
    if (!owner || !repo) {
        throw new Error(`Invalid GITHUB_REPOSITORY value: ${value}`);
    }
    return { owner, repo };
}

function readPullRequestNumberFromEvent(eventPath) {
    const payload = JSON.parse(fs.readFileSync(eventPath, 'utf8'));
    const number = payload?.pull_request?.number ?? null;
    return Number.isInteger(number) ? number : null;
}

async function githubRequest({ method, path, token, body = null }) {
    const response = await fetch(`https://api.github.com${path}`, {
        method,
        headers: {
            Accept: 'application/vnd.github+json',
            Authorization: `Bearer ${token}`,
            'X-GitHub-Api-Version': '2022-11-28',
            'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`GitHub API ${method} ${path} failed (${response.status}): ${text}`);
    }
    return response.status === 204 ? null : response.json();
}

export function buildReleaseTrustCommentBody(summaryMarkdown) {
    const summary = String(summaryMarkdown ?? '').trim();
    return `${RELEASE_TRUST_COMMENT_MARKER}
${summary}
`;
}

export function findExistingReleaseTrustComment(comments = []) {
    return comments.find((comment) => String(comment?.body ?? '').includes(RELEASE_TRUST_COMMENT_MARKER)) ?? null;
}

export async function publishReleaseTrustPrComment({
    summaryMarkdown,
    token,
    repository,
    pullRequestNumber,
} = {}) {
    const { owner, repo } = parseRepo(repository);
    const issueCommentsPath = `/repos/${owner}/${repo}/issues/${pullRequestNumber}/comments`;
    const comments = await githubRequest({
        method: 'GET',
        path: `${issueCommentsPath}?per_page=100`,
        token,
    });

    const body = buildReleaseTrustCommentBody(summaryMarkdown);
    const existing = findExistingReleaseTrustComment(comments);

    if (existing?.id) {
        await githubRequest({
            method: 'PATCH',
            path: `/repos/${owner}/${repo}/issues/comments/${existing.id}`,
            token,
            body: { body },
        });
        return Object.freeze({ mode: 'updated', commentId: existing.id });
    }

    const created = await githubRequest({
        method: 'POST',
        path: issueCommentsPath,
        token,
        body: { body },
    });
    return Object.freeze({ mode: 'created', commentId: created?.id ?? null });
}

if (process.argv[1] && process.argv[1].endsWith('releaseTrustPrComment.mjs')) {
    const eventPath = process.env.GITHUB_EVENT_PATH || '';
    if (!eventPath || !fs.existsSync(eventPath)) {
        console.log('[ReleaseTrustPRComment] Skip: no GITHUB_EVENT_PATH payload available.');
        process.exit(0);
    }

    const pullRequestNumber = readPullRequestNumberFromEvent(eventPath);
    if (!pullRequestNumber) {
        console.log('[ReleaseTrustPRComment] Skip: event does not contain a pull_request.number.');
        process.exit(0);
    }

    const token = assertEnv('GITHUB_TOKEN');
    const repository = assertEnv('GITHUB_REPOSITORY');
    const summary = buildReleaseTrustSummary();
    const result = await publishReleaseTrustPrComment({
        summaryMarkdown: summary,
        token,
        repository,
        pullRequestNumber,
    });

    console.log(`[ReleaseTrustPRComment] ${result.mode} comment ${result.commentId ?? 'unknown'}`);
}

