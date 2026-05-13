import { defineConfig } from '@playwright/test';

const HOST = process.env.PLAYWRIGHT_HOST ?? '127.0.0.1';
const PORT = Number(process.env.PLAYWRIGHT_PORT ?? 3105);
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? `http://${HOST}:${PORT}`;
const SHOULD_START_WEBSERVER = !process.env.PLAYWRIGHT_BASE_URL;
const SKIP_BUILD = process.env.PLAYWRIGHT_SKIP_BUILD === '1';
const WEBSERVER_COMMAND = SKIP_BUILD
  ? `npm run start:e2e -- --hostname ${HOST} --port ${PORT}`
  : `npm run build:e2e && npm run start:e2e -- --hostname ${HOST} --port ${PORT}`;

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  fullyParallel: false,
  reporter: 'list',
  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
    headless: true,
  },
  webServer: SHOULD_START_WEBSERVER
    ? {
        command: WEBSERVER_COMMAND,
        url: BASE_URL,
        timeout: 120_000,
        reuseExistingServer: false,
      }
    : undefined,
});
