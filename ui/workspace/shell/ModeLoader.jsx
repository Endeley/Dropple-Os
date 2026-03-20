"use client";

import { useEffect } from "react";
import {
  getWorkspaceDefinition,
  getWorkspaceRegistry,
  resolveWorkspaceContext,
} from "@/platform/workspaces";
import { WorkspaceRoot } from "@/ui/workspace/root/WorkspaceRoot.jsx";

export function ModeLoader({ mode, queryMode = null }) {
  const context = resolveWorkspaceContext({
    workspace: (mode || "").toLowerCase(),
    mode: (queryMode || "").toLowerCase(),
  });
  const workspace = getWorkspaceDefinition(context.definitionId);
  const workspaceRegistry = getWorkspaceRegistry();

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("[ModeLoader] mode:", mode, "queryMode:", queryMode, "context:", context, "workspace:", workspace?.id);
    }
  }, [workspace, context, mode, queryMode]);

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
      modeId={context.mode ?? workspace.id}
      workspaceId={context.definitionId ?? workspace.id}
      profile={workspace.profile ?? "design"}
      workspace={workspace}
      workspaceContext={context}
    />
  );
}
