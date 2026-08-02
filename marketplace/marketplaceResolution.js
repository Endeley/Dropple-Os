function asNonEmptyString(value) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function createMarketplaceResolutionSearchParams({
  entryIntent = 'blueprint',
  query = '',
  mode = 'all',
  category = 'all',
  artifactId = null,
  committed = false,
  expressionStrategy = null,
  expressionTemplateId = null,
  expressionCommitted = false,
} = {}) {
  const params = new URLSearchParams();

  if (entryIntent && entryIntent !== 'blueprint') {
    params.set('entry', entryIntent);
  }
  if (mode && mode !== 'all') {
    params.set('mode', mode);
  }
  if (category && category !== 'all') {
    params.set('category', category);
  }
  if (query) {
    params.set('q', query);
  }

  const normalizedArtifactId = asNonEmptyString(artifactId);
  if (normalizedArtifactId) {
    params.set('artifact', normalizedArtifactId);
  }
  if (committed && normalizedArtifactId) {
    params.set('committed', '1');
  }

  const normalizedExpressionStrategy = asNonEmptyString(expressionStrategy);
  if (normalizedExpressionStrategy) {
    params.set('expression', normalizedExpressionStrategy);
  }

  const normalizedExpressionTemplateId = asNonEmptyString(expressionTemplateId);
  if (normalizedExpressionTemplateId) {
    params.set('expressionTemplate', normalizedExpressionTemplateId);
  }
  if (expressionCommitted && normalizedExpressionTemplateId) {
    params.set('expressionCommitted', '1');
  }

  return params;
}

export function resolveMarketplaceResolutionState(searchParams) {
  const entryIntent = searchParams.get('entry') === 'template' ? 'template' : 'blueprint';

  return Object.freeze({
    entryIntent,
    query: searchParams.get('q') ?? '',
    mode: searchParams.get('mode') ?? 'all',
    category: searchParams.get('category') ?? 'all',
    artifactId: asNonEmptyString(searchParams.get('artifact')),
    committed: searchParams.get('committed') === '1',
    expressionStrategy: asNonEmptyString(searchParams.get('expression')),
    expressionTemplateId: asNonEmptyString(searchParams.get('expressionTemplate')),
    expressionCommitted: searchParams.get('expressionCommitted') === '1',
  });
}
