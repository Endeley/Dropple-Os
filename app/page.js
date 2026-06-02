import { listBlueprintCatalog } from '@/runtime/blueprints/blueprintCatalog.js';
import ProjectHomeClient from './ProjectHomeClient.jsx';

export default function HomePage() {
  return <ProjectHomeClient recommendedBlueprints={listBlueprintCatalog().slice(0, 3)} />;
}
