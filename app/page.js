import { listBlueprintCatalog } from '@/runtime/blueprints/blueprintCatalog.js';
import { decorateBlueprintCategory } from '@/marketplace/blueprintCategories.js';
import ProjectHomeClient from './ProjectHomeClient.jsx';

export default function HomePage() {
  const blueprintCatalog = listBlueprintCatalog().map((entry) => decorateBlueprintCategory(entry));
  return (
    <ProjectHomeClient
      blueprintCatalog={blueprintCatalog}
      recommendedBlueprints={blueprintCatalog.slice(0, 3)}
    />
  );
}
