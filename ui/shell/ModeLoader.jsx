"use client";

import { WorkspaceRegistry } from "../../workspaces/registry";
import { WorkspaceShell } from "./WorkspaceShell";

export function ModeLoader({ mode }) {
  const workspace = WorkspaceRegistry[mode];

  if (!workspace) {
    return <div>Unknown workspace: {mode}</div>;
  }

  return <WorkspaceShell workspace={workspace} />;
}
