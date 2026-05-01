import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { normalizeArtifact } from '@/gallery/artifacts/normalizeArtifact.js';

const FIXTURE_PREFIX = 'fixture-';

function getFixtureDirectory() {
  return path.join(process.cwd(), '.tmp', 'gallery-fixtures');
}

function getFixturePath(galleryId) {
  return path.join(getFixtureDirectory(), `${galleryId}.json`);
}

function ensureFixtureDirectory() {
  const directory = getFixtureDirectory();
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
  return directory;
}

export function isTestGalleryFixtureId(galleryId) {
  return typeof galleryId === 'string' && galleryId.startsWith(FIXTURE_PREFIX);
}

export function createTestGalleryFixture(item) {
  ensureFixtureDirectory();

  const galleryId = `${FIXTURE_PREFIX}${crypto.randomUUID()}`;
  const artifact = normalizeArtifact(item.artifact ?? item, {
    source: 'test gallery fixture',
  });
  const record = {
    id: galleryId,
    title: item.title ?? 'Fixture',
    description: item.description ?? '',
    tags: Array.isArray(item.tags) ? item.tags : [],
    mode: item.mode ?? null,
    createdAt: Date.now(),
    ownerId: item.ownerId ?? 'test-fixture',
    thumbnailUrl: null,
    artifact,
  };

  fs.writeFileSync(getFixturePath(galleryId), JSON.stringify(record, null, 2));
  return record;
}

export function loadTestGalleryFixture(galleryId) {
  if (!isTestGalleryFixtureId(galleryId)) {
    return null;
  }

  const fixturePath = getFixturePath(galleryId);
  if (!fs.existsSync(fixturePath)) {
    return null;
  }

  const record = JSON.parse(fs.readFileSync(fixturePath, 'utf-8'));
  return {
    ...record,
    artifact: normalizeArtifact(record.artifact ?? record, {
      source: 'test gallery fixture load',
    }),
  };
}
