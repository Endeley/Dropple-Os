"use client";

import { useEffect } from "react";
import { WorkspaceRegistry } from "../../../workspaces/registry";
import { setActiveWorkspace } from "@/runtime/state/workspaceState.js";
import { WorkspaceShell } from "./WorkspaceShell";

export function ModeLoader({ mode }) {
  const key = (mode || "").toLowerCase();
  const workspace = WorkspaceRegistry[key];

  if (!workspace) {
    const available = Object.keys(WorkspaceRegistry);
    return (
      <div style={{ padding: 16, fontSize: 14 }}>
        <div style={{ marginBottom: 8 }}>Unknown workspace: {mode}</div>
        <div>Available modes: {available.join(", ")}</div>
      </div>
    );
  }

  useEffect(() => {
    if (!workspace?.id) return;
    setActiveWorkspace(workspace.id, workspace);
  }, [workspace]);

  return <WorkspaceShell workspace={workspace} />;
}
