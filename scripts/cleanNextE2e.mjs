import { readdir, rm } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

const RETRYABLE_CODES = new Set(['EBUSY', 'ENOTEMPTY', 'EPERM']);
const MAX_RETRIES = 6;
const RETRY_DELAY_MS = 120;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function removeWithRetry(path) {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      await rm(path, {
        recursive: true,
        force: true,
        maxRetries: 3,
        retryDelay: 50,
      });
      return;
    } catch (error) {
      if (!RETRYABLE_CODES.has(error?.code) || attempt === MAX_RETRIES) {
        throw error;
      }
      await sleep(RETRY_DELAY_MS * (attempt + 1));
    }
  }
}

export default async function cleanNextE2e() {
  const entries = await readdir(process.cwd(), { withFileTypes: true });
  const e2eDirs = entries
    .filter((entry) => entry.isDirectory() && entry.name.startsWith('.next-e2e'))
    .map((entry) => entry.name)
    .sort();

  for (const dir of e2eDirs) {
    await removeWithRetry(dir);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await cleanNextE2e();
}
