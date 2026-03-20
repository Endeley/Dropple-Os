"use client";

import { ConvexProvider as BaseConvexProvider, ConvexReactClient } from "convex/react";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

function createNoopWatch() {
  return {
    onUpdate() {
      return () => {};
    },
    localQueryResult() {
      return undefined;
    },
    localQueryLogs() {
      return undefined;
    },
    journal() {
      return undefined;
    },
  };
}

function createNoopConvexClient() {
  return {
    watchQuery() {
      return createNoopWatch();
    },
    watchPaginatedQuery() {
      return createNoopWatch();
    },
    mutation() {
      return Promise.resolve(null);
    },
    action() {
      return Promise.resolve(null);
    },
    connectionState() {
      return { hasInflightRequests: false, isWebSocketConnected: false };
    },
    subscribeToConnectionState() {
      return () => {};
    },
    close() {},
  };
}

const convex = convexUrl
  ? new ConvexReactClient(convexUrl)
  : createNoopConvexClient();

export function ConvexProvider({ children }) {
  return <BaseConvexProvider client={convex}>{children}</BaseConvexProvider>;
}
