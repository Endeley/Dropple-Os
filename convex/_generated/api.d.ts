/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as appendEvents from "../appendEvents.js";
import type * as getAuditLogs from "../getAuditLogs.js";
import type * as getDocumentMember from "../getDocumentMember.js";
import type * as getPresence from "../getPresence.js";
import type * as lib_assertPermission from "../lib/assertPermission.js";
import type * as lib_permissions from "../lib/permissions.js";
import type * as lib_writeAuditLog from "../lib/writeAuditLog.js";
import type * as loadDocumentSnapshot from "../loadDocumentSnapshot.js";
import type * as saveDocumentSnapshot from "../saveDocumentSnapshot.js";
import type * as streamEvents from "../streamEvents.js";
import type * as tasks from "../tasks.js";
import type * as updateCursor from "../updateCursor.js";
import type * as updateIntent from "../updateIntent.js";
import type * as updatePresence from "../updatePresence.js";
import type * as updateSelection from "../updateSelection.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  appendEvents: typeof appendEvents;
  getAuditLogs: typeof getAuditLogs;
  getDocumentMember: typeof getDocumentMember;
  getPresence: typeof getPresence;
  "lib/assertPermission": typeof lib_assertPermission;
  "lib/permissions": typeof lib_permissions;
  "lib/writeAuditLog": typeof lib_writeAuditLog;
  loadDocumentSnapshot: typeof loadDocumentSnapshot;
  saveDocumentSnapshot: typeof saveDocumentSnapshot;
  streamEvents: typeof streamEvents;
  tasks: typeof tasks;
  updateCursor: typeof updateCursor;
  updateIntent: typeof updateIntent;
  updatePresence: typeof updatePresence;
  updateSelection: typeof updateSelection;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  stack_auth: {};
};
