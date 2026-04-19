'use client';

/**
 * WorkspaceBridgesRoot (UI Layer)
 *
 * Pure UI boundary.
 *
 * Responsibilities:
 * - Mount runtime bridge system
 *
 * MUST NOT:
 * - import dispatcher
 * - call dispatch
 * - translate intent
 * - own mutation logic
 *
 * Architecture:
 * UI → canvasBus → runtime/input → dispatcher → reducers → runtime → projection → UI
 */

import { RuntimeBridgesRoot } from './RuntimeBridgesRoot.jsx';

export function WorkspaceBridgesRoot() {
    return <RuntimeBridgesRoot />;
}
