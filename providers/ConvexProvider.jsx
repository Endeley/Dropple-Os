"use client";

import { ConvexProvider as BaseConvexProvider, ConvexReactClient } from "convex/react";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const fallbackConvexUrl = "https://dropple-placeholder.invalid";
const convex = new ConvexReactClient(convexUrl || fallbackConvexUrl);

export function ConvexProvider({ children }) {
  return <BaseConvexProvider client={convex}>{children}</BaseConvexProvider>;
}
