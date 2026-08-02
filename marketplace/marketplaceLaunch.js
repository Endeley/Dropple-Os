import {
  applyWorkspaceLaunchContextToSearchParams,
  buildBlueprintLaunchHref,
  buildTemplateDetailLaunchHref,
  createBlueprintLaunchContext,
  createTemplateDetailLaunchContext,
  createWorkspaceLaunchContext,
} from '@/runtime/workspaces/index.js';

function mergeLaunchContexts(blueprintLaunchContext, templateLaunchContext) {
  return createWorkspaceLaunchContext({
    language: templateLaunchContext?.language ?? blueprintLaunchContext?.language ?? null,
    category: templateLaunchContext?.category ?? blueprintLaunchContext?.category ?? null,
    blueprint: blueprintLaunchContext?.blueprint ?? null,
    template: templateLaunchContext?.template ?? null,
    grammar: templateLaunchContext?.grammar ?? blueprintLaunchContext?.grammar ?? null,
    certification: {
      blueprint: blueprintLaunchContext?.certification?.blueprint ?? null,
      template: templateLaunchContext?.certification?.template ?? null,
    },
  });
}

export function buildMarketplaceBlueprintLaunchHref({ blueprint }) {
  return buildBlueprintLaunchHref({
    perspectiveId: 'create',
    blueprintId: blueprint?.id ?? null,
    blueprintVersionId: blueprint?.lineage?.versionId ?? null,
    certificationHash: blueprint?.certification?.hash ?? null,
  });
}

export function buildMarketplaceBlueprintTemplateLaunchHref({ blueprint, template }) {
  const blueprintLaunchContext = createBlueprintLaunchContext({
    blueprintId: blueprint?.id ?? null,
    blueprintVersionId: blueprint?.lineage?.versionId ?? null,
    certificationHash: blueprint?.certification?.hash ?? null,
  });
  const templateLaunchContext = createTemplateDetailLaunchContext(template);

  if (!blueprintLaunchContext || !templateLaunchContext) {
    return '/workspace/create';
  }

  const mergedLaunchContext = mergeLaunchContexts(blueprintLaunchContext, templateLaunchContext);
  const templateHref = buildTemplateDetailLaunchHref(template);
  const url = new URL(templateHref, 'https://dropple.test');
  const mergedSearchParams = applyWorkspaceLaunchContextToSearchParams({
    launchContext: mergedLaunchContext,
    searchParams: url.searchParams,
  });
  const query = mergedSearchParams.toString();

  return query.length > 0 ? `${url.pathname}?${query}` : url.pathname;
}
