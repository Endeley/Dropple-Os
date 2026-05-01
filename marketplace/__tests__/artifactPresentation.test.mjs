import test from 'node:test';
import assert from 'node:assert/strict';

import { ArtifactKind } from '@/gallery/artifacts/types.js';
import { getArtifactPresentation } from '../artifactPresentation.js';

test('getArtifactPresentation returns reproducible capabilities for environment artifacts', () => {
  const presentation = getArtifactPresentation({
    kind: ArtifactKind.ENVIRONMENT,
  });

  assert.equal(presentation.label, 'Reproducible');
  assert.equal(presentation.capabilities.canInstall, true);
  assert.equal(presentation.capabilities.canRemix, true);
  assert.equal(presentation.capabilities.canInspectLineage, true);
});

test('getArtifactPresentation returns final capabilities for snapshot artifacts', () => {
  const presentation = getArtifactPresentation({
    kind: ArtifactKind.SNAPSHOT,
  });

  assert.equal(presentation.label, 'Final');
  assert.equal(presentation.capabilities.canInstall, false);
  assert.equal(presentation.capabilities.canRemix, false);
  assert.equal(presentation.capabilities.canInspectLineage, false);
});

test('getArtifactPresentation throws for unknown artifact kinds', () => {
  assert.throws(
    () => getArtifactPresentation({ kind: 'future-kind' }),
    /Unknown artifact kind: future-kind/,
  );
});
