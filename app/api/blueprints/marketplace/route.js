import { NextResponse } from 'next/server';
import { listBlueprintCatalog } from '@/runtime/blueprints/blueprintCatalog.js';
import { decorateBlueprintCategory } from '@/marketplace/blueprintCategories.js';

function flattenWorkspaceProfiles(workspaceProfiles = {}) {
  return Object.entries(workspaceProfiles ?? {}).flatMap(([profileId, entries]) => {
    if (!Array.isArray(entries)) return [];
    return entries.map((modeId) => ({
      profileId,
      modeId,
    }));
  });
}

function normalizeMarketplaceBlueprint(blueprint) {
  const workspaceEntries = flattenWorkspaceProfiles(blueprint?.workspaceProfiles);
  const modes = [...new Set(workspaceEntries.map((entry) => entry.modeId).filter(Boolean))];
  const primaryMode =
    workspaceEntries.find((entry) => entry.profileId === 'create')?.modeId ??
    modes[0] ??
    null;

  return decorateBlueprintCategory({
    ...blueprint,
    mode: primaryMode,
    modes,
    metadata: {
      title: blueprint?.name ?? blueprint?.id ?? 'Untitled Blueprint',
      description: blueprint?.description ?? '',
      creator: {
        id: 'dropple',
        name: 'Dropple',
        region: '',
      },
      pricing: { free: true },
      tags: modes,
      level: 'beginner',
    },
  });
}

function loadMarketplaceBlueprints() {
  return listBlueprintCatalog().map(normalizeMarketplaceBlueprint);
}

export function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id') || null;
  const mode = searchParams.get('mode') || null;

  let blueprints = loadMarketplaceBlueprints();

  if (mode) {
    blueprints = blueprints.filter(
      (blueprint) =>
        blueprint?.mode === mode ||
        (Array.isArray(blueprint?.modes) && blueprint.modes.includes(mode)),
    );
  }

  if (id) {
    const blueprint = blueprints.find((entry) => entry?.id === id) ?? null;
    if (!blueprint) {
      return NextResponse.json({ error: 'Blueprint not found.' }, { status: 404 });
    }
    return NextResponse.json({ blueprint });
  }

  return NextResponse.json({ blueprints });
}
