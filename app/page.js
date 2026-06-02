import { listBlueprintCatalog } from '@/runtime/blueprints/blueprintCatalog.js';
import ProjectHomeClient from './ProjectHomeClient.jsx';

export default function HomePage() {
  const blueprintCatalog = listBlueprintCatalog();
  return (
    <ProjectHomeClient
      blueprintCatalog={blueprintCatalog}
      recommendedBlueprints={blueprintCatalog.slice(0, 3)}
    />
  );
}
