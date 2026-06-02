function asNonEmptyString(value) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeTokens(value) {
  const normalized = asNonEmptyString(value)?.toLowerCase() ?? '';
  return normalized.split(/[^a-z0-9]+/u).map((token) => token.trim()).filter(Boolean);
}

export const BLUEPRINT_CATEGORIES = Object.freeze([
  Object.freeze({ id: 'business', label: 'Business' }),
  Object.freeze({ id: 'creative', label: 'Creative' }),
  Object.freeze({ id: 'technology', label: 'Technology' }),
  Object.freeze({ id: 'engineering', label: 'Engineering' }),
  Object.freeze({ id: 'education', label: 'Education' }),
  Object.freeze({ id: 'operations', label: 'Operations' }),
]);

const CATEGORY_BY_ID = new Map(BLUEPRINT_CATEGORIES.map((category) => [category.id, category]));

function categoryLabel(categoryId) {
  return CATEGORY_BY_ID.get(categoryId)?.label ?? 'Business';
}

function includeAny(tokens, candidates) {
  return candidates.some((candidate) => tokens.includes(candidate));
}

export function inferBlueprintCategory({
  id = null,
  name = null,
  description = null,
  mode = null,
  tags = [],
  workspaceProfiles = {},
} = {}) {
  const tokens = [
    ...normalizeTokens(id),
    ...normalizeTokens(name),
    ...normalizeTokens(description),
    ...normalizeTokens(mode),
    ...(Array.isArray(tags) ? tags.flatMap((tag) => normalizeTokens(tag)) : []),
    ...Object.keys(workspaceProfiles ?? {}).flatMap((profileId) => normalizeTokens(profileId)),
    ...Object.values(workspaceProfiles ?? {}).flatMap((entries) =>
      Array.isArray(entries) ? entries.flatMap((entry) => normalizeTokens(entry)) : [],
    ),
  ];

  if (includeAny(tokens, ['education', 'lesson', 'training', 'course', 'knowledge'])) return 'education';
  if (includeAny(tokens, ['logistics', 'fleet', 'dispatch', 'warehouse', 'operations', 'supply'])) return 'operations';
  if (includeAny(tokens, ['systems', 'engineering', 'robotics', 'cad', 'simulation'])) return 'engineering';
  if (includeAny(tokens, ['automation', 'application', 'ai', 'technology', 'software', 'conversion', 'translate'])) {
    return 'technology';
  }
  if (includeAny(tokens, ['graphic', 'branding', 'icons', 'document', 'uiux', 'animation', 'video', 'audio', 'media', 'creative'])) {
    return 'creative';
  }
  return 'business';
}

export function decorateBlueprintCategory(entry = {}) {
  const categoryId = inferBlueprintCategory(entry);
  return Object.freeze({
    ...entry,
    blueprintCategory: categoryId,
    blueprintCategoryLabel: categoryLabel(categoryId),
  });
}
