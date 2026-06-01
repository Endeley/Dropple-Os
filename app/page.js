import Link from 'next/link';
import { listBlueprintCatalog } from '@/runtime/blueprints/blueprintCatalog.js';
import { buildProjectHomeSnapshot } from '@/runtime/workspaces/projectHomeSnapshot.js';

export default function HomePage() {
  const snapshot = buildProjectHomeSnapshot({
    recentProjects: [],
    recommendedBlueprints: listBlueprintCatalog().slice(0, 3),
    continueRoute: '/workspace/overview',
  });

  return (
    <main style={{ padding: 32, display: 'grid', gap: 16 }}>
      <h1>Dropple OS</h1>
      <p>Project-centered creative operating system.</p>

      <section aria-label='Recent Projects'>
        <h2 style={{ fontSize: 18, marginBottom: 8 }}>Recent Projects</h2>
        {snapshot.recentProjects.length === 0 ? (
          <p style={{ margin: 0 }}>No recent projects yet.</p>
        ) : (
          <ul>
            {snapshot.recentProjects.map((project) => (
              <li key={project.projectId}>
                {project.name} ({project.projectId})
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-label='Continue Working'>
        <h2 style={{ fontSize: 18, marginBottom: 8 }}>Continue Working</h2>
        <Link href={snapshot.continueRoute}>Open Project Space</Link>
      </section>

      <section aria-label='Recommended Blueprints'>
        <h2 style={{ fontSize: 18, marginBottom: 8 }}>Recommended Blueprints</h2>
        <ul>
          {snapshot.recommendedBlueprints.map((blueprint) => (
            <li key={blueprint.id}>
              <strong>{blueprint.name}</strong>: {blueprint.description}
            </li>
          ))}
        </ul>
      </section>

      <section aria-label='Marketplace'>
        <h2 style={{ fontSize: 18, marginBottom: 8 }}>Marketplace</h2>
        <Link href={snapshot.marketplaceRoute}>Browse Marketplace</Link>
      </section>
    </main>
  );
}
