import { readdir, rm } from 'node:fs/promises';

const entries = await readdir(process.cwd(), { withFileTypes: true });
const e2eDirs = entries
  .filter((entry) => entry.isDirectory() && entry.name.startsWith('.next-e2e'))
  .map((entry) => entry.name)
  .sort();

for (const dir of e2eDirs) {
  await rm(dir, { recursive: true, force: true });
}
