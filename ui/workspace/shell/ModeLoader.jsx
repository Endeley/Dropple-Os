"use client";

import { useEffect } from "react";
import {
  getWorkspaceDefinition,
  getWorkspaceRegistry,
  resolveWorkspaceId,
} from "@/platform/workspaces";
import { WorkspaceRoot } from "@/ui/workspace/root/WorkspaceRoot.jsx";

export function ModeLoader({ mode }) {
  const key = resolveWorkspaceId((mode || "").toLowerCase());
  const workspace = getWorkspaceDefinition(key);
  const workspaceRegistry = getWorkspaceRegistry();

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("[ModeLoader] mode:", mode, "key:", key, "workspace:", workspace?.id);
    }
  }, [workspace, key, mode]);

  if (!workspace) {
    const available = Object.keys(workspaceRegistry);
    return (
      <div style={{ padding: 16, fontSize: 14 }}>
        <div style={{ marginBottom: 8 }}>Unknown workspace: {mode}</div>
        <div>Available modes: {available.join(", ")}</div>
      </div>
    );
  }

  return (
    <WorkspaceRoot
      modeId={workspace.id}
      workspaceId={workspace.id}
      profile={workspace.profile ?? "design"}
      workspace={workspace}
    />
  );
}
