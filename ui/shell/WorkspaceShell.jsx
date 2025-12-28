"use client";

export function WorkspaceShell({ workspace }) {
  return (
    <div>
      <header>{workspace.label}</header>
      <main>Workspace canvas will mount here</main>
    </div>
  );
}
