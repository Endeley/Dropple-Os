import { mkdir, open, rm } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';

const DIST_DIR = process.env.E2E_NEXT_DIST_DIR || path.join(os.tmpdir(), 'dropple-next-e2e');
const LOCK_FILE = path.join(path.dirname(DIST_DIR), 'dropple-next-e2e.build.lock');
const LOCK_RETRY_MS = 150;
const LOCK_TIMEOUT_MS = 120_000;

async function sleep(ms) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function acquireLock() {
  await mkdir(path.dirname(LOCK_FILE), { recursive: true });
  const startedAt = Date.now();
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      const handle = await open(LOCK_FILE, 'wx');
      return handle;
    } catch (error) {
      if (error?.code !== 'EEXIST') throw error;
      if (Date.now() - startedAt >= LOCK_TIMEOUT_MS) {
        throw new Error(`Timed out waiting for e2e build lock: ${LOCK_FILE}`);
      }
      await sleep(LOCK_RETRY_MS);
    }
  }
}

async function cleanDistDir() {
  await mkdir(path.dirname(DIST_DIR), { recursive: true });
  await rm(DIST_DIR, {
    recursive: true,
    force: true,
    maxRetries: 8,
    retryDelay: 80,
  });
}

function runBuild() {
  return new Promise((resolve, reject) => {
    const child = spawn('next', ['build'], {
      stdio: 'inherit',
      env: {
        ...process.env,
        DROPPLE_E2E: '1',
        NEXT_PUBLIC_CONVEX_URL: '',
        NEXT_DIST_DIR: DIST_DIR,
      },
      shell: true,
    });

    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`next build failed with exit code ${code ?? 'unknown'}`));
    });
  });
}

const lockHandle = await acquireLock();
try {
  await cleanDistDir();
  await runBuild();
} finally {
  await lockHandle.close().catch(() => {});
  await rm(LOCK_FILE, { force: true }).catch(() => {});
}
