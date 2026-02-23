"use client";

import { useEffect } from "react";
import { WorkspaceRegistry } from "../../../workspaces/registry";
import { EventTypes } from "@/core/events/eventTypes.js";
import { useDispatcher } from "@/ui/workspace/root/DispatcherProvider/DispatcherContext.jsx";
import { WorkspaceShell } from "./WorkspaceShell";

export function ModeLoader({ mode }) {
  const dispatcher = useDispatcher();
  const key = (mode || "").toLowerCase();
  const workspace = WorkspaceRegistry[key];

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("[ModeLoader] mode:", mode, "key:", key, "workspace:", workspace?.id);
    }
    if (!workspace?.id) return;
    dispatcher.dispatch({
      type: EventTypes.WORKSPACE_SET_ACTIVE,
      payload: { id: workspace.id, workspaceDef: workspace },
    });
  }, [dispatcher, workspace]);

  if (!workspace) {
    const available = Object.keys(WorkspaceRegistry);
    return (
      <div style={{ padding: 16, fontSize: 14 }}>
        <div style={{ marginBottom: 8 }}>Unknown workspace: {mode}</div>
        <div>Available modes: {available.join(", ")}</div>
      </div>
    );
  }

  return <WorkspaceShell workspace={workspace} />;
}
