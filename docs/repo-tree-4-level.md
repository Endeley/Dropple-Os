# Repo Tree (4 Levels)

Generated from the current workspace at `2026-04-15T19:56:57.023Z`.

Notes:
- Depth is capped at 4 levels below repo root.
- Generated/transient directories are excluded: `.git`, `node_modules`, `.next*`, `test-results*`.
- Comments are best-effort: exact for well-known framework files, otherwise inferred from file names and local directory ownership.

```text
dropple/  # Project root.
├── .ai/  # AI-generated repo maps and law/audit artifacts.
│   ├── authority-map.json  # authority map data/config artifact.
│   ├── authority-violations.json  # authority violations data/config artifact.
│   ├── mutation-map.json  # mutation map data/config artifact.
│   ├── truth-map.json  # truth map data/config artifact.
│   └── ui-runtime-state-violations.json  # ui runtime state violations data/config artifact.
├── .cursor/  # Cursor/MCP local editor integration config.
│   └── mcp.json  # mcp data/config artifact.
├── .github/  # GitHub templates, ownership, and CI workflows.
│   ├── ISSUE_TEMPLATE/  # ISSUE TEMPLATE directory.
│   │   ├── core.yml  # core automation/config file.
│   │   ├── dropple-custom.yml  # dropple custom automation/config file.
│   │   ├── phase-1-create-delete-states.yml  # phase 1 create delete states automation/config file.
│   │   ├── phase-1-default-state-ui.yml  # phase 1 default state ui automation/config file.
│   │   ├── phase-1-lock-guardrails.yml  # phase 1 lock guardrails automation/config file.
│   │   ├── phase-1-persistence-verification.yml  # phase 1 persistence verification automation/config file.
│   │   ├── phase-1-runtime-awareness.yml  # phase 1 runtime awareness automation/config file.
│   │   ├── phase-1-state-editing.yml  # phase 1 state editing automation/config file.
│   │   ├── phase-1-state-model.yml  # phase 1 state model automation/config file.
│   │   ├── phase-1-state-panel-shell.yml  # phase 1 state panel shell automation/config file.
│   │   ├── phase-1-state-switching.yml  # phase 1 state switching automation/config file.
│   │   ├── phase-1-undo-replay-audit.yml  # phase 1 undo replay audit automation/config file.
│   │   ├── phase-2-transition-audit.yml  # phase 2 transition audit automation/config file.
│   │   ├── phase-2-transition-export.yml  # phase 2 transition export automation/config file.
│   │   ├── phase-2-transition-guardrails.yml  # phase 2 transition guardrails automation/config file.
│   │   ├── phase-2-transition-model.yml  # phase 2 transition model automation/config file.
│   │   ├── phase-2-transition-preview.yml  # phase 2 transition preview automation/config file.
│   │   ├── phase-2-transition-ui.yml  # phase 2 transition ui automation/config file.
│   │   └── uiux.yml  # uiux automation/config file.
│   ├── PULL_REQUEST_TEMPLATE/  # PULL REQUEST TEMPLATE directory.
│   │   ├── n2-guardrails.md  # n2 guardrails documentation/spec.
│   │   ├── phase-1-audit.md  # phase 1 audit documentation/spec.
│   │   ├── phase-1-ui.md  # phase 1 ui documentation/spec.
│   │   ├── phase-1.md  # phase 1 documentation/spec.
│   │   ├── phase-2-audit.md  # phase 2 audit documentation/spec.
│   │   ├── phase-2-export.md  # phase 2 export documentation/spec.
│   │   ├── phase-2-preview.md  # phase 2 preview documentation/spec.
│   │   ├── phase-2-ui.md  # phase 2 ui documentation/spec.
│   │   ├── phase-2.md  # phase 2 documentation/spec.
│   │   └── phase-7-animate-between-states.md  # phase 7 animate between states documentation/spec.
│   ├── workflows/  # workflows directory.
│   │   ├── auto-label.yml  # auto label automation/config file.
│   │   ├── ci.yml  # ci automation/config file.
│   │   ├── enforce-collaboration-labels.yml  # enforce collaboration labels automation/config file.
│   │   └── export-gate.yml  # export gate automation/config file.
│   ├── CODEOWNERS  # CODEOWNERS module.
│   └── labeler.yml  # labeler automation/config file.
├── .registry/  # Checked-in registry payloads and seeded metadata.
│   └── certifiedTemplates.json  # certified Templates data/config artifact.
├── .vscode/  # VS Code workspace settings and MCP config.
│   ├── mcp.json  # mcp data/config artifact.
│   └── settings.json  # settings data/config artifact.
├── ai/  # AI generation logic, prompts, and tests.
│   ├── __tests__/  # Tests colocated with the owning module.
│   │   └── runtimeGeneration.test.mjs  # Automated test covering behavior in this area.
│   ├── generation/  # Asset or template generation logic.
│   │   ├── generateTemplateArtifact.js  # generate Template Artifact template-related helper, UI, or validator.
│   │   ├── generateTemplateArtifact.ts  # generate Template Artifact template-related helper, UI, or validator.
│   │   ├── generateVariants.js  # generate Variants module.
│   │   └── generateVariants.ts  # generate Variants module.
│   ├── prompts/  # Prompt templates used by AI features.
│   │   ├── ccmAuthorPrompt.js  # ccm Author Prompt module.
│   │   └── ccmAuthorPrompt.ts  # ccm Author Prompt module.
│   ├── runtime/  # Execution/runtime modules for the surrounding feature.
│   │   ├── aiRuntime.js  # ai Runtime runtime logic for this feature.
│   │   └── aiSelectors.js  # ai Selectors projection/selector that derives UI-facing data.
│   └── README.md  # Module-level documentation and orientation for this area.
├── app/  # Next.js App Router entrypoints and route shells.
│   ├── api/  # API route handlers and server endpoints.
│   │   ├── auth/  # auth directory.
│   │   │   └── [...nextauth]/  # NextAuth catch-all auth route.
│   │   └── templates/  # Template definitions and template tooling.
│   │       └── certified/  # certified directory.
│   ├── certificates/  # Certificate pages, stores, or types.
│   │   ├── [id]/  # Dynamic route segment keyed by id.
│   │   │   └── page.js  # Next.js route entry page for this path.
│   │   └── page.js  # Next.js route entry page for this path.
│   ├── education/  # education directory.
│   │   └── [lessonId]/  # Dynamic lesson route segment.
│   │       └── page.js  # Next.js route entry page for this path.
│   ├── gallery/  # gallery directory.
│   │   └── page.js  # Next.js route entry page for this path.
│   ├── handler/  # Catch-all handlers and route wrappers.
│   │   └── [...stack]/  # Catch-all route segment for stack handler pages.
│   │       ├── page.js  # Next.js route entry page for this path.
│   │       └── StackHandlerClient.js  # Stack Handler Client client entry component for a route or feature.
│   ├── marketplace/  # Marketplace pages and marketplace-specific UI/data.
│   │   ├── creator/  # creator directory.
│   │   │   └── [name]/  # Dynamic route segment keyed by name.
│   │   ├── lessons/  # Lesson pages, lesson data, and lesson marketplace routes.
│   │   │   ├── [id]/  # Dynamic route segment keyed by id.
│   │   │   ├── creator/  # creator directory.
│   │   │   └── page.js  # Next.js route entry page for this path.
│   │   ├── template/  # template directory.
│   │   │   └── [id]/  # Dynamic route segment keyed by id.
│   │   └── page.js  # Next.js route entry page for this path.
│   ├── persistence/  # Persistence adapters, registries, and snapshot I/O.
│   │   └── worldPersistenceAdapter.js  # world Persistence Adapter module.
│   ├── profile/  # profile directory.
│   │   └── [id]/  # Dynamic route segment keyed by id.
│   │       └── page.js  # Next.js route entry page for this path.
│   ├── review/  # review directory.
│   │   └── submissions/  # Submission lists, stores, and submission schemas.
│   │       └── [id]/  # Dynamic route segment keyed by id.
│   ├── reviews/  # Review routes and review views.
│   │   ├── [submissionId]/  # Dynamic review route segment.
│   │   │   └── page.js  # Next.js route entry page for this path.
│   │   └── page.js  # Next.js route entry page for this path.
│   ├── verify/  # verify directory.
│   │   └── [certificateId]/  # Dynamic certificate verification route segment.
│   │       └── page.js  # Next.js route entry page for this path.
│   ├── viewer/  # Viewer route/UI code.
│   │   ├── [galleryId]/  # Dynamic gallery viewer route segment.
│   │   │   ├── page.js  # Next.js route entry page for this path.
│   │   │   └── ViewerClient.jsx  # Viewer Client client entry component for a route or feature.
│   │   └── page.js  # Next.js route entry page for this path.
│   ├── workspace/  # workspace directory.
│   │   ├── [mode]/  # Dynamic workspace route segment by mode.
│   │   │   └── page.js  # Next.js route entry page for this path.
│   │   ├── design/  # design directory.
│   │   │   ├── DesignWorkspaceClient.jsx  # Design Workspace Client client entry component for a route or feature.
│   │   │   └── page.js  # Next.js route entry page for this path.
│   │   ├── new/  # new directory.
│   │   │   └── page.js  # Next.js route entry page for this path.
│   │   ├── layout.js  # Next.js route layout wrapper for this route subtree.
│   │   └── page.js  # Next.js route entry page for this path.
│   ├── favicon.ico  # favicon static asset or key material.
│   ├── globals.css  # globals stylesheet.
│   ├── layout.js  # Next.js route layout wrapper for this route subtree.
│   ├── loading.js  # Next.js route loading UI.
│   ├── page.js  # Next.js route entry page for this path.
│   ├── providers.jsx  # providers provider/composition component.
│   └── README.md  # Module-level documentation and orientation for this area.
├── architecture/  # Architecture plans, truth-boundary docs, and generated maps.
│   ├── dependencyGraph.json  # dependency Graph data/config artifact.
│   ├── MEDIA_WORKSPACE_PLAN.md  # MEDIA WORKSPACE PLAN documentation/spec.
│   ├── MIGRATION_PLAN.md  # MIGRATION PLAN documentation/spec.
│   ├── phaseMap.json  # phase Map data/config artifact.
│   ├── systemMap.json  # system Map data/config artifact.
│   ├── TRUTH_BOUNDARIES.md  # TRUTH BOUNDARIES documentation/spec.
│   └── WORKSPACE_STRATEGY.md  # WORKSPACE STRATEGY documentation/spec.
├── audit/  # Audit-oriented UI components and views.
│   └── AuditLogPanel.jsx  # Audit Log Panel panel component for a feature workspace.
├── auth/  # Authentication-focused app/domain code.
├── bench/  # Benchmark loaders and perf harnesses.
│   ├── alias-loader.mjs  # alias loader module.
│   ├── engineBench.js  # engine Bench module.
│   └── register-alias-loader.mjs  # register alias loader module.
├── branching/  # Branch graph, merge, and conflict UI/helpers.
│   ├── conflicts/  # Conflict detection and merge/conflict UI.
│   │   ├── ConflictWarnings.jsx  # Conflict Warnings module.
│   │   └── detectBranchConflicts.js  # detect Branch Conflicts module.
│   ├── graph/  # Graph authoring, graph evaluation, and graph views.
│   │   ├── BranchGraph.jsx  # Branch Graph module.
│   │   └── buildBranchGraph.js  # build Branch Graph module.
│   ├── merge/  # Merge planning, merge simulation, and merge UI.
│   │   ├── __tests__/  # Tests colocated with the owning module.
│   │   │   ├── applyMerge.test.mjs  # Automated test covering behavior in this area.
│   │   │   ├── computeMergeDiff.test.mjs  # Automated test covering behavior in this area.
│   │   │   ├── mergePipeline.test.mjs  # Automated test covering behavior in this area.
│   │   │   ├── planMerge.test.mjs  # Automated test covering behavior in this area.
│   │   │   └── simulateMergeState.test.mjs  # Automated test covering behavior in this area.
│   │   ├── applyMerge.js  # apply Merge merge helper or merge UI module.
│   │   ├── computeMergeDiff.js  # compute Merge Diff merge helper or merge UI module.
│   │   ├── computeNodeDiff.js  # compute Node Diff module.
│   │   ├── MergePreview 2.jsx  # Merge Preview 2 merge helper or merge UI module.
│   │   ├── MergePreview.jsx  # Merge Preview merge helper or merge UI module.
│   │   ├── planMerge.js  # plan Merge merge helper or merge UI module.
│   │   ├── resolveBranchMergeArtifacts.js  # resolve Branch Merge Artifacts merge helper or merge UI module.
│   │   ├── simulateMergeState.js  # simulate Merge State merge helper or merge UI module.
│   │   └── VisualNodeDiffOverlay.jsx  # Visual Node Diff Overlay overlay component rendered above the main surface.
│   └── ui/  # UI composition for the surrounding feature.
│       ├── BranchSwitcher.jsx  # Branch Switcher module.
│       ├── CreateBranch.jsx  # Create Branch module.
│       ├── MergeBranch.jsx  # Merge Branch merge helper or merge UI module.
│       └── useBranchState.js  # use Branch State hook/helper for consuming or deriving feature state.
├── canvas/  # Canvas rendering helpers and viewport transforms.
│   ├── render/  # render directory.
│   │   ├── layout/  # Layout pipelines, layout pass logic, and layout helpers.
│   │   │   └── applyLayout.js  # apply Layout layout helper or layout pipeline module.
│   │   ├── style/  # style directory.
│   │   │   └── applyStyle.js  # apply Style module.
│   │   ├── types/  # Type definitions.
│   │   │   ├── renderImage.js  # render Image module.
│   │   │   └── renderText.js  # render Text module.
│   │   ├── renderDesignCanvas.js  # render Design Canvas canvas-related component or helper.
│   │   ├── renderFrame.js  # render Frame module.
│   │   └── renderNode.js  # render Node module.
│   ├── test/  # Area-specific tests or manual test fixtures.
│   │   └── renderTest.html  # render Test HTML fixture or manual test surface.
│   ├── transform/  # Transform helpers and coordinate conversion.
│   │   ├── projectRectToViewport.js  # project Rect To Viewport module.
│   │   ├── projectToViewport.js  # project To Viewport module.
│   │   └── screenToWorld.js  # screen To World module.
│   └── viewport/  # Viewport state and viewport helpers.
│       └── getViewportBounds.js  # get Viewport Bounds module.
├── certification/  # Certification, assessment, and rubric domain/UI.
│   ├── annotations/  # Annotation types, stores, and annotation helpers.
│   │   ├── annotationTypes.ts  # annotation Types schema/type/contract definition.
│   │   └── useAnnotationStore.js  # use Annotation Store hook/helper for consuming or deriving feature state.
│   ├── assessments/  # Assessment models and assessment-related helpers.
│   │   └── assessmentTypes.js  # assessment Types schema/type/contract definition.
│   ├── certificates/  # Certificate pages, stores, or types.
│   │   ├── certificateTypes.ts  # certificate Types schema/type/contract definition.
│   │   └── useCertificateStore.js  # use Certificate Store hook/helper for consuming or deriving feature state.
│   ├── replay/  # Replay logic and determinism helpers.
│   │   └── hashReplay.js  # hash Replay module.
│   ├── rubrics/  # Rubric schemas and rubric helpers.
│   │   └── rubricTypes.js  # rubric Types schema/type/contract definition.
│   ├── submissions/  # Submission lists, stores, and submission schemas.
│   │   ├── SubmissionList.jsx  # Submission List module.
│   │   ├── submissionTypes.js  # submission Types schema/type/contract definition.
│   │   └── useSubmissionStore.js  # use Submission Store hook/helper for consuming or deriving feature state.
│   └── SubmitAssessmentButton.jsx  # Submit Assessment Button button/action component.
├── collab/  # Live collaboration, presence, merge, and optimistic sync.
│   ├── __tests__/  # Tests colocated with the owning module.
│   │   └── presenceRuntime.test.mjs  # Automated test covering behavior in this area.
│   ├── optimistic/  # Optimistic collaboration state and reconciliation.
│   │   ├── createOptimisticTx.js  # create Optimistic Tx module.
│   │   ├── mergeOptimistic.js  # merge Optimistic merge helper or merge UI module.
│   │   ├── optimisticStore.js  # optimistic Store state store or state container.
│   │   ├── optimisticTransaction.js  # optimistic Transaction module.
│   │   └── reconcileOptimism.js  # reconcile Optimism module.
│   ├── applyMergedLog.js  # apply Merged Log merge helper or merge UI module.
│   ├── CanvasCursors.jsx  # Canvas Cursors canvas-related component or helper.
│   ├── CanvasIntentGhosts.jsx  # Canvas Intent Ghosts intent emitter or intent translation helper.
│   ├── CanvasSelectionPresence.jsx  # Canvas Selection Presence canvas-related component or helper.
│   ├── CursorsLayer.jsx  # Cursors Layer module.
│   ├── eventEnvelope.js  # event Envelope event definition, adapter, or event helper.
│   ├── eventLog.js  # event Log event definition, adapter, or event helper.
│   ├── filterConflicts.js  # filter Conflicts module.
│   ├── lamportClock.js  # lamport Clock module.
│   ├── lockManager.js  # lock Manager module.
│   ├── mergeEvents.js  # merge Events event definition, adapter, or event helper.
│   ├── permissionPolicy.js  # permission Policy module.
│   ├── policyGate.js  # policy Gate module.
│   ├── PresenceDots.jsx  # Presence Dots module.
│   ├── presenceStore.js  # presence Store state store or state container.
│   ├── remoteEventAdapter.js  # remote Event Adapter event definition, adapter, or event helper.
│   ├── throttle.js  # throttle module.
│   ├── useDocumentRole.js  # use Document Role hook/helper for consuming or deriving feature state.
│   ├── useIntentPreview.js  # use Intent Preview hook/helper for consuming or deriving feature state.
│   ├── useLiveCursors.js  # use Live Cursors hook/helper for consuming or deriving feature state.
│   ├── usePresence.js  # use Presence hook/helper for consuming or deriving feature state.
│   ├── useRemoteEventCommit.js  # use Remote Event Commit hook/helper for consuming or deriving feature state.
│   └── useSelectionPresence.js  # use Selection Presence hook/helper for consuming or deriving feature state.
├── collaboration/  # Collaboration-specific UI panels and composition.
│   └── panels/  # Panel components grouped by feature.
│       └── SharingPanel.jsx  # Sharing Panel panel component for a feature workspace.
├── commands/  # Command palette UI and command registries.
│   ├── CommandPalette.jsx  # Command Palette module.
│   ├── commandRegistry.js  # command Registry registry/lookup table for feature definitions.
│   ├── filterCommands.js  # filter Commands module.
│   ├── groupCommands.js  # group Commands module.
│   └── useCommandPalette.js  # use Command Palette hook/helper for consuming or deriving feature state.
├── contracts/  # Typed contracts shared across product layers.
│   ├── droppleSpec.ts  # dropple Spec module.
│   ├── edge.ts  # edge module.
│   ├── history.ts  # history module.
│   ├── intent.ts  # intent intent emitter or intent translation helper.
│   ├── mode.ts  # mode module.
│   ├── node.ts  # node module.
│   ├── selection.ts  # selection module.
│   ├── transform.ts  # transform module.
│   ├── workspaceContract.v1.ts  # workspace Contract v1 schema/type/contract definition.
│   └── world.ts  # world module.
├── convex/  # Convex backend functions, schema, and persistence endpoints.
│   ├── _generated/  # generated directory.
│   │   ├── api.d.ts  # api d module.
│   │   ├── api.js  # api module.
│   │   ├── dataModel.d.ts  # data Model d module.
│   │   ├── server.d.ts  # server d module.
│   │   └── server.js  # server module.
│   ├── _helpers/  # helpers directory.
│   │   ├── assertOwnershipInvariant.js  # assert Ownership Invariant module.
│   │   ├── ensureOwnerMember.js  # ensure Owner Member module.
│   │   └── permissions.js  # permissions module.
│   ├── lib/  # Library adapters and shared code.
│   │   ├── assertPermission.js  # assert Permission module.
│   │   ├── audit.ts  # audit module.
│   │   ├── permissions.js  # permissions module.
│   │   └── writeAuditLog.js  # write Audit Log module.
│   ├── migrations/  # Data/schema migration scripts.
│   │   └── repairMissingOwners.js  # repair Missing Owners module.
│   ├── analytics.js  # analytics module.
│   ├── appendEvents.js  # append Events event definition, adapter, or event helper.
│   ├── assessments.js  # assessments module.
│   ├── auth.config.ts  # auth config module.
│   ├── certificates.ts  # certificates module.
│   ├── collaboration.js  # collaboration module.
│   ├── convex.config.ts  # convex config module.
│   ├── gallery.js  # gallery module.
│   ├── getAuditLogs.js  # get Audit Logs module.
│   ├── getDocumentMember.js  # get Document Member module.
│   ├── getPresence.js  # get Presence module.
│   ├── loadDocumentSnapshot.js  # load Document Snapshot module.
│   ├── README.md  # Module-level documentation and orientation for this area.
│   ├── saveDocumentSnapshot.js  # save Document Snapshot module.
│   ├── schema.js  # schema schema/type/contract definition.
│   ├── seed.js  # seed module.
│   ├── streamEvents.js  # stream Events event definition, adapter, or event helper.
│   ├── tasks.ts  # tasks module.
│   ├── tsconfig.json  # TypeScript/JS path and compiler configuration.
│   ├── updateCursor.js  # update Cursor module.
│   ├── updateIntent.js  # update Intent intent emitter or intent translation helper.
│   ├── updatePresence.js  # update Presence module.
│   └── updateSelection.js  # update Selection module.
├── core/  # Pure core logic: events, contracts, math, structure, and truth rules.
│   ├── animation/  # Animation-specific runtime or engine modules.
│   │   └── AnimationSchema.js  # Animation Schema schema/type/contract definition.
│   ├── architecture/  # Architecture docs, guards, or generated reports.
│   │   └── LAYER_CONTRACTS.md  # LAYER CONTRACTS documentation/spec.
│   ├── behavior/  # behavior directory.
│   │   ├── behaviorGraphBoundary.js  # behavior Graph Boundary module.
│   │   └── resolveBehaviorTrigger.js  # resolve Behavior Trigger module.
│   ├── ccm/  # ccm directory.
│   │   ├── migration/  # migration directory.
│   │   │   └── LegacyTemplateConverter.ts  # Legacy Template Converter template-related helper, UI, or validator.
│   │   ├── schema/  # Schemas and canonical data shapes.
│   │   │   ├── template.v1.js  # template v1 template-related helper, UI, or validator.
│   │   │   └── template.v1.ts  # template v1 template-related helper, UI, or validator.
│   │   ├── validate/  # validate directory.
│   │   │   ├── schema/  # Schemas and canonical data shapes.
│   │   │   ├── validate/  # validate directory.
│   │   │   ├── types.js  # types schema/type/contract definition.
│   │   │   ├── validateTemplateArtifact.js  # validate Template Artifact template-related helper, UI, or validator.
│   │   │   └── validateTemplateArtifact.ts  # validate Template Artifact template-related helper, UI, or validator.
│   │   ├── types.js  # types schema/type/contract definition.
│   │   └── types.ts  # types schema/type/contract definition.
│   ├── contracts/  # contracts directory.
│   │   ├── adaptWorkspaceToContractV1.js  # adapt Workspace To Contract V1 schema/type/contract definition.
│   │   ├── BehaviorGraphContract.js  # Behavior Graph Contract schema/type/contract definition.
│   │   ├── CanvasPolicy.js  # Canvas Policy canvas-related component or helper.
│   │   ├── capabilityGate.js  # capability Gate module.
│   │   ├── EngineContract.js  # Engine Contract schema/type/contract definition.
│   │   ├── ExportContract.js  # Export Contract schema/type/contract definition.
│   │   ├── intentCapabilities.v1.js  # intent Capabilities v1 intent emitter or intent translation helper.
│   │   ├── project.v2.ts  # project v2 module.
│   │   ├── sceneGraph.v1.ts  # scene Graph v1 module.
│   │   ├── TimelineContract.js  # Timeline Contract schema/type/contract definition.
│   │   └── WorkspaceContract.js  # Workspace Contract schema/type/contract definition.
│   ├── document/  # Document model, document adapters, and boot helpers.
│   │   ├── createDocument.ts  # create Document module.
│   │   └── documentSchema.ts  # document Schema schema/type/contract definition.
│   ├── events/  # Event definitions, apply/replay helpers, and sequencing.
│   │   ├── reducers/  # reducers directory.
│   │   │   ├── aiReducers.js  # ai Reducers module.
│   │   │   ├── animationReducers.js  # animation Reducers animation helper or animation UI/runtime module.
│   │   │   ├── behaviorReducers.js  # behavior Reducers module.
│   │   │   ├── collaborationReducers.js  # collaboration Reducers module.
│   │   │   ├── componentStateReducers.js  # component State Reducers module.
│   │   │   ├── graphInteractionReducer.js  # graph Interaction Reducer module.
│   │   │   ├── graphReducers.js  # graph Reducers module.
│   │   │   ├── index.js  # Barrel/export entry for the reducers area.
│   │   │   ├── interactionReducers.js  # interaction Reducers module.
│   │   │   ├── layoutDirtyHelpers.js  # layout Dirty Helpers layout helper or layout pipeline module.
│   │   │   ├── layoutReducers.js  # layout Reducers layout helper or layout pipeline module.
│   │   │   ├── motionReducers.js  # motion Reducers module.
│   │   │   ├── navigationReducers.js  # navigation Reducers module.
│   │   │   ├── nodeReducers.js  # node Reducers module.
│   │   │   ├── nodeStructureReducers.js  # node Structure Reducers module.
│   │   │   ├── rigReducers.js  # rig Reducers module.
│   │   │   ├── sceneShotReducers.js  # scene Shot Reducers module.
│   │   │   ├── selectionReducers.js  # selection Reducers module.
│   │   │   ├── sequenceReducers.js  # sequence Reducers module.
│   │   │   ├── stateMachineReducers.js  # state Machine Reducers module.
│   │   │   ├── stateReducers.js  # state Reducers module.
│   │   │   ├── styleReducers.js  # style Reducers module.
│   │   │   ├── timelineReducers.js  # timeline Reducers timeline-related helper or UI surface.
│   │   │   ├── transitionReducers.js  # transition Reducers module.
│   │   │   ├── treeReducers.js  # tree Reducers module.
│   │   │   ├── vectorReducers.js  # vector Reducers module.
│   │   │   └── viewportReducer.js  # viewport Reducer module.
│   │   ├── applyEvent.js  # apply Event event definition, adapter, or event helper.
│   │   ├── eventTypes.js  # event Types schema/type/contract definition.
│   │   ├── graphInteractionState.js  # graph Interaction State module.
│   │   ├── README.md  # Module-level documentation and orientation for this area.
│   │   ├── reducerOwnership.js  # reducer Ownership module.
│   │   ├── selectionEvents.js  # selection Events event definition, adapter, or event helper.
│   │   ├── systemEventRegistry.js  # system Event Registry registry/lookup table for feature definitions.
│   │   ├── vectorDocumentReducer.js  # vector Document Reducer module.
│   │   └── viewportEvents.js  # viewport Events event definition, adapter, or event helper.
│   ├── history/  # Undo/redo and history helpers.
│   │   └── historyStack.js  # history Stack module.
│   ├── interactions/  # Interaction models, pure interaction logic, or UI integration.
│   │   └── InteractionSchema.js  # Interaction Schema schema/type/contract definition.
│   ├── ir/  # Intermediate representations and compiler shapes.
│   │   ├── BaseIR.js  # Base IR module.
│   │   ├── ComponentIR.js  # Component IR module.
│   │   ├── DesignIR.js  # Design IR module.
│   │   ├── index.js  # Barrel/export entry for the ir area.
│   │   ├── InteractionIR.js  # Interaction IR module.
│   │   ├── MotionIR.js  # Motion IR module.
│   │   ├── SemanticIR.js  # Semantic IR module.
│   │   └── StateIR.js  # State IR module.
│   ├── math/  # Pure math helpers.
│   │   └── pixelRounding.js  # pixel Rounding module.
│   ├── nodes/  # Node models, evaluators, or node-specific helpers.
│   │   └── createNode.js  # create Node module.
│   ├── persistence/  # Persistence adapters, registries, and snapshot I/O.
│   │   ├── documentEnvelope.js  # document Envelope module.
│   │   ├── getDesignStateAtCursor.js  # get Design State At Cursor module.
│   │   ├── hashDocument.js  # hash Document module.
│   │   ├── index.js  # Barrel/export entry for the persistence area.
│   │   └── replayEngine.js  # replay Engine module.
│   ├── project/  # project directory.
│   │   ├── initProjectWithSceneGraph.v2.ts  # init Project With Scene Graph v2 module.
│   │   ├── loadProject.v2.ts  # load Project v2 module.
│   │   └── normalizeShotTransitionOut.js  # normalize Shot Transition Out module.
│   ├── scene/  # Scene graph and scene-specific helpers.
│   │   ├── animationBinding.v1.ts  # animation Binding v1 animation helper or animation UI/runtime module.
│   │   ├── cameraPlayback.v1.js  # camera Playback v1 module.
│   │   ├── cameraPlayback.v1.ts  # camera Playback v1 module.
│   │   ├── node.js  # node module.
│   │   ├── nodeTypes.js  # node Types schema/type/contract definition.
│   │   ├── selectors.v1.js  # selectors v1 projection/selector that derives UI-facing data.
│   │   ├── selectors.v1.ts  # selectors v1 projection/selector that derives UI-facing data.
│   │   └── shotTracks.js  # shot Tracks module.
│   ├── structure/  # Structure rules, tree edits, and structural helpers.
│   │   ├── attachNode.js  # attach Node module.
│   │   ├── detachNode.js  # detach Node module.
│   │   ├── reorderNode.js  # reorder Node module.
│   │   ├── reparentNode.js  # reparent Node module.
│   │   ├── unwrapNode.js  # unwrap Node module.
│   │   └── wrapNodes.js  # wrap Nodes module.
│   ├── transitions/  # Transition models and transition evaluation.
│   │   ├── README.md  # Module-level documentation and orientation for this area.
│   │   └── transitionSchema.js  # transition Schema schema/type/contract definition.
│   ├── variants/  # Variant definitions and variant helpers.
│   │   ├── validateVariantSnapshot.js  # validate Variant Snapshot module.
│   │   └── validateVariantSnapshot.ts  # validate Variant Snapshot module.
│   ├── viewport/  # Viewport state and viewport helpers.
│   │   └── cameraPolicy.js  # camera Policy module.
│   ├── index.js  # Barrel/export entry for the core area.
│   ├── messageBus.js  # message Bus module.
│   ├── mutationContext.js  # mutation Context React context and shared state surface.
│   └── README.md  # Module-level documentation and orientation for this area.
├── design/  # Legacy design-state and reducer-era modules.
│   ├── canvas/  # Canvas rendering and canvas-surface code.
│   │   ├── behaviorPreview/  # behavior Preview directory.
│   │   │   ├── BehaviorPreviewLayer.jsx  # Behavior Preview Layer module.
│   │   │   └── evaluateBehaviorPreview.js  # evaluate Behavior Preview module.
│   │   ├── capabilities/  # Capability registries, activation, and runtime wiring.
│   │   │   └── behaviorCapabilities.js  # behavior Capabilities module.
│   │   └── tools/  # Tool definitions, tool availability, and tool helpers.
│   │       ├── registerBindTriggerTool.js  # register Bind Trigger Tool module.
│   │       ├── registerCreateStateTool.js  # register Create State Tool module.
│   │       ├── registerDefineTransitionTool.js  # register Define Transition Tool module.
│   │       └── ToolSessionController.jsx  # Tool Session Controller module.
│   ├── reducer/  # reducer directory.
│   │   ├── nodeContentReducer.js  # node Content Reducer module.
│   │   ├── nodeLayoutReducer.js  # node Layout Reducer layout helper or layout pipeline module.
│   │   ├── nodeLifecycleReducer.js  # node Lifecycle Reducer module.
│   │   ├── nodeStructureReducer.js  # node Structure Reducer module.
│   │   └── nodeStyleReducer.js  # node Style Reducer module.
│   ├── state/  # State models and state utilities.
│   │   ├── createDesignState.js  # create Design State module.
│   │   └── normalizeNodeShape.js  # normalize Node Shape module.
│   └── test/  # Area-specific tests or manual test fixtures.
├── dev/  # Developer entrypoints and local pipeline runners.
│   ├── index.js  # Barrel/export entry for the dev area.
│   ├── runExportPipeline.js  # run Export Pipeline export helper or export pipeline module.
│   └── runTranslatePipeline.js  # run Translate Pipeline module.
├── docs/  # Architecture, laws, specs, and contributor documentation.
│   ├── ai/  # ai directory.
│   │   └── ccm-v1-ai-generation-prompt-contract.md  # ccm v1 ai generation prompt contract documentation/spec.
│   ├── architecture/  # Architecture docs, guards, or generated reports.
│   │   ├── core/  # core directory.
│   │   │   └── RUNTIME_STATE_CONTRACT_V1.md  # RUNTIME STATE CONTRACT V1 documentation/spec.
│   │   ├── ccm.md  # ccm documentation/spec.
│   │   ├── CHANGELOG.md  # CHANGELOG documentation/spec.
│   │   ├── dropple-runtime-expansion-plan.md  # dropple runtime expansion plan documentation/spec.
│   │   ├── interaction.md  # interaction documentation/spec.
│   │   ├── PROJECTION_V1_FREEZE.md  # PROJECTION V1 FREEZE documentation/spec.
│   │   ├── README.md  # Module-level documentation and orientation for this area.
│   │   ├── rendering.md  # rendering documentation/spec.
│   │   ├── why-not-realtime-yet.md  # why not realtime yet documentation/spec.
│   │   └── workspace-routing.md  # workspace routing documentation/spec.
│   ├── DECISIONS/  # DECISIONS directory.
│   │   ├── 001-single-dispatcher.md  # 001 single dispatcher documentation/spec.
│   │   ├── 002-intent-only-ui.md  # 002 intent only ui documentation/spec.
│   │   └── 003-ccm-node-truth.md  # 003 ccm node truth documentation/spec.
│   ├── dropple-ui-architecture/  # dropple ui architecture directory.
│   │   └── README.md  # Module-level documentation and orientation for this area.
│   ├── invariants/  # invariants directory.
│   │   └── N1.1-ownership-membership.md  # N1 1 ownership membership documentation/spec.
│   ├── marketplace/  # Marketplace pages and marketplace-specific UI/data.
│   │   └── ccm-marketplace-eligibility.md  # ccm marketplace eligibility documentation/spec.
│   ├── migrations/  # Data/schema migration scripts.
│   │   ├── ccm-migration-approval.md  # ccm migration approval documentation/spec.
│   │   ├── legacy-only-flag.md  # legacy only flag documentation/spec.
│   │   ├── legacy-to-ccm-implementation-plan.md  # legacy to ccm implementation plan documentation/spec.
│   │   ├── legacy-to-ccm.md  # legacy to ccm documentation/spec.
│   │   ├── migration-audit-report.md  # migration audit report documentation/spec.
│   │   ├── README.md  # Module-level documentation and orientation for this area.
│   │   └── reorg-file-map.csv  # reorg file map module.
│   ├── phases/  # phases directory.
│   │   ├── N1-completion.md  # N1 completion documentation/spec.
│   │   ├── N1.2-members-role-changes.md  # N1 2 members role changes documentation/spec.
│   │   └── N3-realtime-editing.md  # N3 realtime editing documentation/spec.
│   ├── transition-ui/  # transition ui directory.
│   │   └── README.md  # Module-level documentation and orientation for this area.
│   ├── ux-mode/  # ux mode directory.
│   │   ├── anti-patterns.md  # anti patterns documentation/spec.
│   │   ├── authority.md  # authority documentation/spec.
│   │   ├── confirm-tier.md  # confirm tier documentation/spec.
│   │   ├── intent-and-escalation.md  # intent and escalation documentation/spec.
│   │   ├── lock.md  # lock documentation/spec.
│   │   ├── overview.md  # overview documentation/spec.
│   │   ├── phase-3.md  # phase 3 documentation/spec.
│   │   ├── phase-4-escalation.md  # phase 4 escalation documentation/spec.
│   │   ├── phase-4-warnings.md  # phase 4 warnings documentation/spec.
│   │   ├── phase-4.md  # phase 4 documentation/spec.
│   │   ├── phase-5-implementation-plan.md  # phase 5 implementation plan documentation/spec.
│   │   ├── phase-5-leakage-audit.md  # phase 5 leakage audit documentation/spec.
│   │   ├── phase-5.md  # phase 5 documentation/spec.
│   │   ├── phase-6-leakage-audit.md  # phase 6 leakage audit documentation/spec.
│   │   ├── phase-6.md  # phase 6 documentation/spec.
│   │   ├── phase-a-locked.md  # phase a locked documentation/spec.
│   │   ├── phases.md  # phases documentation/spec.
│   │   └── README.md  # Module-level documentation and orientation for this area.
│   ├── add-a-tool.md  # add a tool documentation/spec.
│   ├── animate-between-states.md  # animate between states documentation/spec.
│   ├── ANIMATION_GRAPH_COMPOSITION_POLICY_V1.md  # ANIMATION GRAPH COMPOSITION POLICY V1 documentation/spec.
│   ├── ANIMATION_V1.md  # ANIMATION V1 documentation/spec.
│   ├── ARCHITECTURE_BLUEPRINT.md  # ARCHITECTURE BLUEPRINT documentation/spec.
│   ├── ARCHITECTURE_LAWS.md  # ARCHITECTURE LAWS documentation/spec.
│   ├── architecture.md  # architecture documentation/spec.
│   ├── AUTHORITY_TRANSLATION_LAYER_V1.md  # AUTHORITY TRANSLATION LAYER V1 documentation/spec.
│   ├── BLEND_V1.md  # BLEND V1 documentation/spec.
│   ├── BONE_KEYFRAME_AUTHORING_V2_1.md  # BONE KEYFRAME AUTHORING V2 1 documentation/spec.
│   ├── BONE_NODE_DEFORMATION_CONTRACT_V2_3.md  # BONE NODE DEFORMATION CONTRACT V2 3 documentation/spec.
│   ├── capability-vocabulary-v1-canonical.md  # capability vocabulary v1 canonical documentation/spec.
│   ├── contributor-onboarding.md  # contributor onboarding documentation/spec.
│   ├── CORE_BEHAVIOR_ENGINE_V1.md  # CORE BEHAVIOR ENGINE V1 documentation/spec.
│   ├── CORE_ENGINE_FREEZE_V1.md  # CORE ENGINE FREEZE V1 documentation/spec.
│   ├── deployment-strategy.md  # deployment strategy documentation/spec.
│   ├── DEV_GUIDE.md  # DEV GUIDE documentation/spec.
│   ├── DO_NOT_BREAK.md  # DO NOT BREAK documentation/spec.
│   ├── DROPPLE_COMPLETION_PLAN.md  # DROPPLE COMPLETION PLAN documentation/spec.
│   ├── DROPPLE_CONSTITUTIONAL_LAW.md  # DROPPLE CONSTITUTIONAL LAW documentation/spec.
│   ├── DROPPLE_SKELETON_V2_SPEC.md  # DROPPLE SKELETON V2 SPEC documentation/spec.
│   ├── dropple-custom-tools-ui-layer-overlay-v1.md  # dropple custom tools ui layer overlay v1 documentation/spec.
│   ├── dropple-v1-implementation-checklist.md  # dropple v1 implementation checklist documentation/spec.
│   ├── dropple-v1-ui-lock-document.md  # dropple v1 ui lock document documentation/spec.
│   ├── dropple-v1-ui-spec.md  # dropple v1 ui spec documentation/spec.
│   ├── EDITOR_RUNTIME_DIAGRAM.md  # EDITOR RUNTIME DIAGRAM documentation/spec.
│   ├── ENGINE_ARCHITECTURE.md  # ENGINE ARCHITECTURE documentation/spec.
│   ├── ESLINT-GUARDRAILS.md  # ESLINT GUARDRAILS documentation/spec.
│   ├── failure-modes.md  # failure modes documentation/spec.
│   ├── FK_IK_SOLVER_CONTRACTS_V2_2.md  # FK IK SOLVER CONTRACTS V2 2 documentation/spec.
│   ├── FK_IK_SOLVER_CONTRACTS.md  # FK IK SOLVER CONTRACTS documentation/spec.
│   ├── floating-ephemeral-tools-v1-locked.md  # floating ephemeral tools v1 locked documentation/spec.
│   ├── github-issue-labels-canonical.md  # github issue labels canonical documentation/spec.
│   ├── github-milestones-v1-roadmap.md  # github milestones v1 roadmap documentation/spec.
│   ├── LAW.md  # LAW documentation/spec.
│   ├── milestone-2-uiux-workspace-issues.md  # milestone 2 uiux workspace issues documentation/spec.
│   ├── milestone-3-floating-ui-ghost-preview-issues.md  # milestone 3 floating ui ghost preview issues documentation/spec.
│   ├── milestone-4-template-creation-issues.md  # milestone 4 template creation issues documentation/spec.
│   ├── milestone-4-tier1-tier2-issues.md  # milestone 4 tier1 tier2 issues documentation/spec.
│   ├── non-destructive-implementation-rule-v1.md  # non destructive implementation rule v1 documentation/spec.
│   ├── PERSISTENCE_AUTHORITY_V1.md  # PERSISTENCE AUTHORITY V1 documentation/spec.
│   ├── phase-2-project-board.md  # phase 2 project board documentation/spec.
│   ├── phase-4h-audit-checklist.md  # phase 4h audit checklist documentation/spec.
│   ├── phase-4h-playback.md  # phase 4h playback documentation/spec.
│   ├── phase-7-diff-plan.md  # phase 7 diff plan documentation/spec.
│   ├── PROJECTION_LAYER_V1.md  # PROJECTION LAYER V1 documentation/spec.
│   ├── public-overview.md  # public overview documentation/spec.
│   ├── README.md  # Module-level documentation and orientation for this area.
│   ├── rules.md  # rules documentation/spec.
│   ├── RUNTIME_ARCHITECTURE.md  # RUNTIME ARCHITECTURE documentation/spec.
│   ├── SCENE_TRANSITION_SYSTEM_V1.md  # SCENE TRANSITION SYSTEM V1 documentation/spec.
│   ├── SEQUENCE_SHOT_SCENE_AUTHORITY_V1.md  # SEQUENCE SHOT SCENE AUTHORITY V1 documentation/spec.
│   ├── session-recap-ux-mode.md  # session recap ux mode documentation/spec.
│   ├── SKELETON_BONE_NODE_DEFORMATION_V2.md  # SKELETON BONE NODE DEFORMATION V2 documentation/spec.
│   ├── SKELETON_CHARACTER_INTEGRATION_RULES_V2.md  # SKELETON CHARACTER INTEGRATION RULES V2 documentation/spec.
│   ├── SKELETON_CHARACTER_INTEGRATION_V2_5.md  # SKELETON CHARACTER INTEGRATION V2 5 documentation/spec.
│   ├── SKELETON_DEBUG_LAYER.md  # SKELETON DEBUG LAYER documentation/spec.
│   ├── SKELETON_DEBUG_OVERLAYS_V2.md  # SKELETON DEBUG OVERLAYS V2 documentation/spec.
│   ├── SKELETON_DEBUG_UI_V2.md  # SKELETON DEBUG UI V2 documentation/spec.
│   ├── SKELETON_EDITOR_UI_V2.md  # SKELETON EDITOR UI V2 documentation/spec.
│   ├── SKELETON_EDITOR_UX_CREATION_PARENTING_MIRRORING.md  # SKELETON EDITOR UX CREATION PARENTING MIRRORING documentation/spec.
│   ├── SKELETON_FAILURE_MODES_V2_6.md  # SKELETON FAILURE MODES V2 6 documentation/spec.
│   ├── SKELETON_FAILURE_MODES_V2_9.md  # SKELETON FAILURE MODES V2 9 documentation/spec.
│   ├── SKELETON_FAILURE_MODES_V2.md  # SKELETON FAILURE MODES V2 documentation/spec.
│   ├── SKELETON_FK_IK_BLEND_RULES_V2.md  # SKELETON FK IK BLEND RULES V2 documentation/spec.
│   ├── SKELETON_V2_LOCKED.md  # SKELETON V2 LOCKED documentation/spec.
│   ├── SKELETON_V2.md  # SKELETON V2 documentation/spec.
│   ├── SKELETON_V3_BONE_INFLUENCE_MATH.md  # SKELETON V3 BONE INFLUENCE MATH documentation/spec.
│   ├── SKELETON_V3_DEFORMATION_MODES.md  # SKELETON V3 DEFORMATION MODES documentation/spec.
│   ├── SKELETON_V3_SKETCH.md  # SKELETON V3 SKETCH documentation/spec.
│   ├── SKELETON_V3_WEIGHT_PAINTING.md  # SKELETON V3 WEIGHT PAINTING documentation/spec.
│   ├── SYSTEM_DATAFLOW.md  # SYSTEM DATAFLOW documentation/spec.
│   ├── SYSTEM_OVERVIEW_DIAGRAM.md  # SYSTEM OVERVIEW DIAGRAM documentation/spec.
│   ├── template-data-contracts-and-marketplace-flow-v1.md  # template data contracts and marketplace flow v1 documentation/spec.
│   ├── TIMELINE_ENGINE_V2_DAG.md  # TIMELINE ENGINE V2 DAG documentation/spec.
│   ├── tool-compliance-checklist.md  # tool compliance checklist documentation/spec.
│   ├── tool-contracts.md  # tool contracts documentation/spec.
│   ├── tool-ui-layer-grouping-v1.md  # tool ui layer grouping v1 documentation/spec.
│   ├── UI-AUTHORITY.md  # UI AUTHORITY documentation/spec.
│   ├── ui-implementation-checklist.md  # ui implementation checklist documentation/spec.
│   ├── ui-layer-architecture-v1-law.md  # ui layer architecture v1 law documentation/spec.
│   ├── ui-phase-1-states.md  # ui phase 1 states documentation/spec.
│   ├── ui-phase-2-transition-preview.md  # ui phase 2 transition preview documentation/spec.
│   ├── ui-phase-2-transitions.md  # ui phase 2 transitions documentation/spec.
│   ├── ui-phase-3-interactions.md  # ui phase 3 interactions documentation/spec.
│   ├── ui-phase-4-animations.md  # ui phase 4 animations documentation/spec.
│   ├── uiux-inspector-v1-final-spec.md  # uiux inspector v1 final spec documentation/spec.
│   ├── why-templates-are-better-in-dropple-v1.md  # why templates are better in dropple v1 documentation/spec.
│   └── workspace-capability-map-v1-canonical.md  # workspace capability map v1 canonical documentation/spec.
├── domain/  # Domain model helpers separated from UI/runtime concerns.
│   ├── geometry/  # Geometry-specific math helpers.
│   │   └── selectionBounds.js  # selection Bounds module.
│   ├── math/  # Pure math helpers.
│   │   └── lerp.js  # lerp module.
│   ├── scene/  # Scene graph and scene-specific helpers.
│   │   └── buildSceneTree.js  # build Scene Tree module.
│   ├── templates/  # Template definitions and template tooling.
│   │   ├── __tests__/  # Tests colocated with the owning module.
│   │   │   ├── TemplateCertification.test.mjs  # Automated test covering behavior in this area.
│   │   │   └── TemplateRegistry.test.mjs  # Automated test covering behavior in this area.
│   │   ├── official/  # official directory.
│   │   │   ├── uiuxStarter.graph.js  # uiux Starter graph module.
│   │   │   └── uiuxStarter.template.js  # uiux Starter template template-related helper, UI, or validator.
│   │   ├── graphToRuntimeSnapshot.js  # graph To Runtime Snapshot runtime logic for this feature.
│   │   ├── installCertifiedTemplate.js  # install Certified Template template-related helper, UI, or validator.
│   │   ├── SceneGraphContract.js  # Scene Graph Contract schema/type/contract definition.
│   │   ├── TemplateCertification.js  # Template Certification template-related helper, UI, or validator.
│   │   ├── TemplateHasher.js  # Template Hasher template-related helper, UI, or validator.
│   │   ├── TemplateRegistry.js  # Template Registry registry/lookup table for feature definitions.
│   │   ├── TemplateRegistryIntegrity.js  # Template Registry Integrity registry/lookup table for feature definitions.
│   │   └── TemplateVersioning.js  # Template Versioning template-related helper, UI, or validator.
│   └── timeline/  # Timeline UI, runtime, or data helpers.
│       ├── flattenTimeline.js  # flatten Timeline timeline-related helper or UI surface.
│       ├── TimelineContract.js  # Timeline Contract schema/type/contract definition.
│       ├── TrackContract.js  # Track Contract schema/type/contract definition.
│       └── TrackGroupContract.js  # Track Group Contract schema/type/contract definition.
├── editor/  # Editor document/bootstrap helpers.
│   └── openServerDocument.js  # open Server Document module.
├── education/  # Education workspace panels, stores, and helpers.
│   ├── ai/  # ai directory.
│   │   ├── buildEvidenceContext.js  # build Evidence Context React context and shared state surface.
│   │   ├── buildExplanationPrompt.js  # build Explanation Prompt module.
│   │   ├── buildQAPrompt.js  # build QAPrompt module.
│   │   ├── computeStateDiff.js  # compute State Diff module.
│   │   ├── ExplanationAgent.js  # Explanation Agent module.
│   │   └── QAAgent.js  # QAAgent module.
│   ├── certification/  # certification directory.
│   │   ├── AssessmentSchema.js  # Assessment Schema schema/type/contract definition.
│   │   ├── CertificateSchema.js  # Certificate Schema schema/type/contract definition.
│   │   ├── GradingAgent.js  # Grading Agent module.
│   │   ├── isCertified.js  # is Certified module.
│   │   ├── RubricSchema.js  # Rubric Schema schema/type/contract definition.
│   │   └── SubmissionSchema.js  # Submission Schema schema/type/contract definition.
│   ├── lesson/  # lesson directory.
│   │   ├── downloadLesson.js  # download Lesson module.
│   │   ├── exportLesson.js  # export Lesson export helper or export pipeline module.
│   │   ├── importLesson.js  # import Lesson importer or import adapter.
│   │   ├── LessonPlayer.js  # Lesson Player module.
│   │   ├── LessonSchema.js  # Lesson Schema schema/type/contract definition.
│   │   └── selectLessonRange.js  # select Lesson Range module.
│   ├── AnnotationOverlay.js  # Annotation Overlay overlay component rendered above the main surface.
│   ├── AnnotationOverlay.jsx  # Annotation Overlay overlay component rendered above the main surface.
│   ├── AnnotationPanel.js  # Annotation Panel panel component for a feature workspace.
│   ├── AnnotationStore.js  # Annotation Store state store or state container.
│   ├── EducationAnnotationsContext.jsx  # Education Annotations Context React context and shared state surface.
│   ├── EducationCursorContext.jsx  # Education Cursor Context React context and shared state surface.
│   ├── EducationInspector.jsx  # Education Inspector module.
│   ├── EducationTimelinePanel.jsx  # Education Timeline Panel panel component for a feature workspace.
│   ├── EducationToolbar.jsx  # Education Toolbar toolbar component for feature controls.
│   ├── forkLessonToWorkspace.js  # fork Lesson To Workspace workspace-specific entry, contract, or helper.
│   ├── lessonEvents.js  # lesson Events event definition, adapter, or event helper.
│   ├── selectEducationState.js  # select Education State module.
│   └── useAnnotations.js  # use Annotations hook/helper for consuming or deriving feature state.
├── engine/  # Deterministic engine logic for evaluation, layout, animation, and export.
│   ├── __tests__/  # Tests colocated with the owning module.
│   │   ├── alignmentClusters.test.mjs  # Automated test covering behavior in this area.
│   │   ├── applicationCompiler.test.mjs  # Automated test covering behavior in this area.
│   │   ├── compilerPipeline.test.mjs  # Automated test covering behavior in this area.
│   │   ├── componentGenerator.test.mjs  # Automated test covering behavior in this area.
│   │   ├── dataCompiler.test.mjs  # Automated test covering behavior in this area.
│   │   ├── deployment.test.mjs  # Automated test covering behavior in this area.
│   │   ├── designSystemCompiler.test.mjs  # Automated test covering behavior in this area.
│   │   ├── deterministicReplayCertification.test.mjs  # Automated test covering behavior in this area.
│   │   ├── diffTimeline.test.mjs  # Automated test covering behavior in this area.
│   │   ├── editorInteractions.test.mjs  # Automated test covering behavior in this area.
│   │   ├── evaluateLayout.flow.test.mjs  # Automated test covering behavior in this area.
│   │   ├── evaluateLayout.grid.test.mjs  # Automated test covering behavior in this area.
│   │   ├── evaluateTimeline.test.mjs  # Automated test covering behavior in this area.
│   │   ├── exportStabilityGate.test.mjs  # Automated test covering behavior in this area.
│   │   ├── formCompiler.test.mjs  # Automated test covering behavior in this area.
│   │   ├── gridPatterns.test.mjs  # Automated test covering behavior in this area.
│   │   ├── guideEngine.test.mjs  # Automated test covering behavior in this area.
│   │   ├── irHash.test.mjs  # Automated test covering behavior in this area.
│   │   ├── irValidation.test.mjs  # Automated test covering behavior in this area.
│   │   ├── layoutConversion.test.mjs  # Automated test covering behavior in this area.
│   │   ├── reactCompiler.test.mjs  # Automated test covering behavior in this area.
│   │   ├── snapEngine.test.mjs  # Automated test covering behavior in this area.
│   │   ├── snapshotDag.test.mjs  # Automated test covering behavior in this area.
│   │   ├── snapshotLabeling.test.mjs  # Automated test covering behavior in this area.
│   │   ├── spacingGuides.test.mjs  # Automated test covering behavior in this area.
│   │   ├── spatialIndex.test.mjs  # Automated test covering behavior in this area.
│   │   ├── structureHelpers.test.mjs  # Automated test covering behavior in this area.
│   │   ├── symmetryAxes.test.mjs  # Automated test covering behavior in this area.
│   │   ├── templateCertification.test.mjs  # Automated test covering behavior in this area.
│   │   ├── templateCompiler.test.mjs  # Automated test covering behavior in this area.
│   │   ├── templateInstall.test.mjs  # Automated test covering behavior in this area.
│   │   ├── timelineContract.test.mjs  # Automated test covering behavior in this area.
│   │   ├── timelineController.diff.test.mjs  # Automated test covering behavior in this area.
│   │   ├── timelineController.test.mjs  # Automated test covering behavior in this area.
│   │   ├── timelineHistory.test.mjs  # Automated test covering behavior in this area.
│   │   ├── timelineProjection.test.mjs  # Automated test covering behavior in this area.
│   │   ├── trackBlendMode.test.mjs  # Automated test covering behavior in this area.
│   │   ├── trackContract.test.mjs  # Automated test covering behavior in this area.
│   │   ├── trackDispatcher.test.mjs  # Automated test covering behavior in this area.
│   │   ├── trackGrouping.test.mjs  # Automated test covering behavior in this area.
│   │   ├── trackLock.test.mjs  # Automated test covering behavior in this area.
│   │   ├── unwrapNode.test.mjs  # Automated test covering behavior in this area.
│   │   ├── vectorEngine.test.mjs  # Automated test covering behavior in this area.
│   │   ├── workflowCompiler.test.mjs  # Automated test covering behavior in this area.
│   │   └── wrapNodes.test.mjs  # Automated test covering behavior in this area.
│   ├── alignment/  # alignment directory.
│   │   ├── alignNodes.js  # align Nodes module.
│   │   ├── computeAlignmentBounds.js  # compute Alignment Bounds module.
│   │   └── distributeNodes.js  # distribute Nodes module.
│   ├── animation/  # Animation-specific runtime or engine modules.
│   │   ├── preview/  # Preview runtime and non-committed visual state.
│   │   │   └── previewAtTime.js  # preview At Time module.
│   │   ├── tools/  # Tool definitions, tool availability, and tool helpers.
│   │   │   ├── keyframeTool.js  # keyframe Tool module.
│   │   │   ├── motionPresets.js  # motion Presets module.
│   │   │   └── trackTool.js  # track Tool module.
│   │   ├── animationIR.js  # animation IR animation helper or animation UI/runtime module.
│   │   ├── easingPresets.js  # easing Presets module.
│   │   ├── evaluateAnimation.js  # evaluate Animation animation helper or animation UI/runtime module.
│   │   ├── evaluateMotion.js  # evaluate Motion module.
│   │   └── timelineSchema.js  # timeline Schema schema/type/contract definition.
│   ├── camera/  # camera directory.
│   │   └── cameraPolicy.js  # camera Policy module.
│   ├── canvas/  # Canvas rendering and canvas-surface code.
│   │   └── nodeTree.js  # node Tree module.
│   ├── clock/  # Clock, playback, and time-control code.
│   ├── compiler/  # Compilation and normalization logic.
│   │   ├── application/  # application directory.
│   │   │   ├── data/  # Data runtime and data evaluation code.
│   │   │   ├── forms/  # forms directory.
│   │   │   ├── workflows/  # workflows directory.
│   │   │   ├── applicationContext.js  # application Context React context and shared state surface.
│   │   │   ├── compileInteractions.js  # compile Interactions module.
│   │   │   ├── compileNavigation.js  # compile Navigation module.
│   │   │   └── compileState.js  # compile State module.
│   │   ├── compilers/  # compilers directory.
│   │   │   ├── compileBindings.js  # compile Bindings module.
│   │   │   ├── compileComponents.js  # compile Components module.
│   │   │   ├── compileInteractions.js  # compile Interactions module.
│   │   │   ├── compileLayout.js  # compile Layout layout helper or layout pipeline module.
│   │   │   ├── compileNavigation.js  # compile Navigation module.
│   │   │   ├── compileState.js  # compile State module.
│   │   │   ├── compileStructure.js  # compile Structure module.
│   │   │   └── compileStyles.js  # compile Styles module.
│   │   ├── designSystem/  # design System directory.
│   │   │   ├── compileComponents.js  # compile Components module.
│   │   │   ├── compileDesignTokens.js  # compile Design Tokens module.
│   │   │   ├── compileThemes.js  # compile Themes module.
│   │   │   ├── compileVariants.js  # compile Variants module.
│   │   │   ├── componentCompiler.js  # component Compiler module.
│   │   │   ├── cssVariableGenerator.js  # css Variable Generator module.
│   │   │   ├── index.js  # Barrel/export entry for the designSystem area.
│   │   │   ├── libraryGenerator.js  # library Generator module.
│   │   │   ├── reactComponentGenerator.js  # react Component Generator module.
│   │   │   ├── reactDesignSystemTarget.js  # react Design System Target module.
│   │   │   ├── themeCompiler.js  # theme Compiler module.
│   │   │   ├── tokenCompiler.js  # token Compiler module.
│   │   │   └── variantCompiler.js  # variant Compiler module.
│   │   ├── emit/  # emit directory.
│   │   │   ├── emitFiles.js  # emit Files module.
│   │   │   └── emitProject.js  # emit Project module.
│   │   ├── generators/  # generators directory.
│   │   │   ├── componentGenerator.js  # component Generator module.
│   │   │   ├── projectGenerator.js  # project Generator module.
│   │   │   └── screenGenerator.js  # screen Generator module.
│   │   ├── layout/  # Layout pipelines, layout pass logic, and layout helpers.
│   │   │   ├── containerCompiler.js  # container Compiler module.
│   │   │   ├── gridCompiler.js  # grid Compiler module.
│   │   │   ├── layoutPrimitives.js  # layout Primitives layout helper or layout pipeline module.
│   │   │   ├── rowCompiler.js  # row Compiler module.
│   │   │   ├── spacerCompiler.js  # spacer Compiler module.
│   │   │   └── stackCompiler.js  # stack Compiler module.
│   │   ├── pipeline/  # pipeline directory.
│   │   │   ├── compilerContext.js  # compiler Context React context and shared state surface.
│   │   │   └── compilerPipeline.js  # compiler Pipeline module.
│   │   ├── targets/  # targets directory.
│   │   │   └── react/  # react directory.
│   │   ├── compileProject.js  # compile Project module.
│   │   └── index.js  # Barrel/export entry for the compiler area.
│   ├── constraints/  # Constraint solvers and constraint evaluation code.
│   │   ├── stack/  # stack directory.
│   │   │   └── constraintStack.js  # constraint Stack module.
│   │   ├── constraintEngine.js  # constraint Engine module.
│   │   ├── resizeConstraintEngine.js  # resize Constraint Engine module.
│   │   ├── selectionBounds.test.mjs  # Automated test covering behavior in this area.
│   │   ├── snapEngine.js  # snap Engine module.
│   │   └── snapUtils.js  # snap Utils module.
│   ├── deploy/  # Deployment/export deployment helpers.
│   │   └── index.js  # Barrel/export entry for the deploy area.
│   ├── evaluation/  # Evaluation pipeline and derived-runtime computation.
│   │   ├── channelContract.js  # channel Contract schema/type/contract definition.
│   │   ├── evaluateFrameAt.js  # evaluate Frame At module.
│   │   ├── evaluateFrameHeadless.js  # evaluate Frame Headless module.
│   │   ├── evaluateScene.fixture.test.mjs  # Automated test covering behavior in this area.
│   │   ├── evaluateScene.js  # evaluate Scene module.
│   │   ├── evaluateShotAt.fixture.test.mjs  # Automated test covering behavior in this area.
│   │   ├── evaluateShotAt.js  # evaluate Shot At module.
│   │   ├── extractChannels.js  # extract Channels module.
│   │   ├── hashFrame.js  # hash Frame module.
│   │   ├── parityDevCommand.js  # parity Dev Command module.
│   │   └── validateFrameParity.js  # validate Frame Parity module.
│   ├── export/  # Export logic and export-related UI/runtime code.
│   │   ├── react/  # react directory.
│   │   │   └── exportReact.js  # export React export helper or export pipeline module.
│   │   ├── exportController.js  # export Controller export helper or export pipeline module.
│   │   └── exportStabilityGate.js  # export Stability Gate export helper or export pipeline module.
│   ├── guides/  # Guide generation and alignment/spacing guide logic.
│   │   ├── computeAlignmentClusters.js  # compute Alignment Clusters module.
│   │   ├── computeDistanceGuides.js  # compute Distance Guides module.
│   │   ├── computeGridPatterns.js  # compute Grid Patterns module.
│   │   ├── computeGuides.js  # compute Guides module.
│   │   ├── computeSpacingGuides.js  # compute Spacing Guides module.
│   │   ├── computeSymmetryAxes.js  # compute Symmetry Axes module.
│   │   └── guideAggregator.js  # guide Aggregator module.
│   ├── init/  # init directory.
│   ├── ir/  # Intermediate representations and compiler shapes.
│   │   ├── extractCanvasIR.js  # extract Canvas IR canvas-related component or helper.
│   │   ├── extractComponentIR.js  # extract Component IR module.
│   │   ├── extractDesignIR.js  # extract Design IR module.
│   │   ├── extractInteractionIR.js  # extract Interaction IR module.
│   │   ├── extractMotionIR.js  # extract Motion IR module.
│   │   ├── extractSemanticIR.js  # extract Semantic IR module.
│   │   ├── extractStateIR.js  # extract State IR module.
│   │   ├── hashIR.js  # hash IR module.
│   │   └── validateIR.js  # validate IR module.
│   ├── layout/  # Layout pipelines, layout pass logic, and layout helpers.
│   │   ├── computeLayoutInference.js  # compute Layout Inference layout helper or layout pipeline module.
│   │   ├── computeReorderIndex.js  # compute Reorder Index module.
│   │   ├── convertLayout.js  # convert Layout layout helper or layout pipeline module.
│   │   ├── detectColumns.js  # detect Columns module.
│   │   ├── detectGrids.js  # detect Grids module.
│   │   ├── detectRows.js  # detect Rows module.
│   │   ├── detectStacks.js  # detect Stacks module.
│   │   ├── evaluateLayout.js  # evaluate Layout layout helper or layout pipeline module.
│   │   ├── findDropTarget.js  # find Drop Target module.
│   │   ├── isAutoLayoutChild.js  # is Auto Layout Child layout helper or layout pipeline module.
│   │   ├── layoutChildren.js  # layout Children layout helper or layout pipeline module.
│   │   ├── layoutTypes.js  # layout Types schema/type/contract definition.
│   │   ├── measureLayout.js  # measure Layout layout helper or layout pipeline module.
│   │   ├── resolveConstraintNode.js  # resolve Constraint Node module.
│   │   ├── resolveFlowContainer.js  # resolve Flow Container module.
│   │   ├── resolveGridContainer.js  # resolve Grid Container module.
│   │   └── resolveSizing.js  # resolve Sizing module.
│   ├── measure/  # measure directory.
│   │   ├── measureChildrenBounds.js  # measure Children Bounds module.
│   │   └── measureText.js  # measure Text module.
│   ├── motion/  # motion directory.
│   ├── observability/  # Logging, diagnostics, and observability helpers.
│   │   ├── capabilityIndex.js  # capability Index module.
│   │   ├── complexityCounters.js  # complexity Counters module.
│   │   ├── observability.test.mjs  # Automated test covering behavior in this area.
│   │   └── performanceMonitor.js  # performance Monitor module.
│   ├── replay/  # Replay logic and determinism helpers.
│   │   ├── buildEvaluationFingerprint.js  # build Evaluation Fingerprint module.
│   │   └── replayTimeline.js  # replay Timeline timeline-related helper or UI surface.
│   ├── scene/  # Scene graph and scene-specific helpers.
│   │   ├── evaluateScene.js  # evaluate Scene module.
│   │   └── nodeTree.js  # node Tree module.
│   ├── spatial/  # Spatial indexing and world-space helpers.
│   │   ├── spatialBounds.js  # spatial Bounds module.
│   │   ├── spatialGrid.js  # spatial Grid module.
│   │   ├── spatialIndex.js  # spatial Index module.
│   │   └── spatialQuery.js  # spatial Query module.
│   ├── structure/  # Structure rules, tree edits, and structural helpers.
│   ├── templates/  # Template definitions and template tooling.
│   │   ├── certifyTemplateSeed.js  # certify Template Seed template-related helper, UI, or validator.
│   │   ├── installTemplateSeed.js  # install Template Seed template-related helper, UI, or validator.
│   │   ├── templateCompiler.test.mjs  # Automated test covering behavior in this area.
│   │   ├── templateCompilerV1.js  # template Compiler V1 template-related helper, UI, or validator.
│   │   ├── templateInstaller.js  # template Installer template-related helper, UI, or validator.
│   │   ├── templateLoader.js  # template Loader template-related helper, UI, or validator.
│   │   ├── templateRegistry.js  # template Registry registry/lookup table for feature definitions.
│   │   └── templateSeed.js  # template Seed template-related helper, UI, or validator.
│   ├── text/  # text directory.
│   ├── timeline/  # Timeline UI, runtime, or data helpers.
│   │   ├── commitTimeline.js  # commit Timeline timeline-related helper or UI surface.
│   │   ├── diffTimeline.js  # diff Timeline timeline-related helper or UI surface.
│   │   ├── evaluateTimeline.js  # evaluate Timeline timeline-related helper or UI surface.
│   │   ├── evaluateTimelinePreview.js  # evaluate Timeline Preview timeline-related helper or UI surface.
│   │   ├── snapshotGraph.js  # snapshot Graph module.
│   │   ├── timeline.js  # timeline timeline-related helper or UI surface.
│   │   ├── timelineController.js  # timeline Controller timeline-related helper or UI surface.
│   │   ├── timelineHistory.js  # timeline History timeline-related helper or UI surface.
│   │   └── trackDispatcher.js  # track Dispatcher dispatcher or mutation-funnel implementation.
│   ├── vector/  # Vector drawing/evaluation modules.
│   │   ├── booleanEngine.js  # boolean Engine module.
│   │   ├── pathEngine.js  # path Engine module.
│   │   ├── vectorReducer.js  # vector Reducer module.
│   │   ├── vectorRegistry.js  # vector Registry registry/lookup table for feature definitions.
│   │   ├── vectorRuntime.js  # vector Runtime runtime logic for this feature.
│   │   └── vectorSelectors.js  # vector Selectors projection/selector that derives UI-facing data.
│   ├── index.js  # Barrel/export entry for the engine area.
│   └── README.md  # Module-level documentation and orientation for this area.
├── eslint-rules/  # Custom ESLint rules enforcing repo architecture.
│   └── no-nodeview-projection.js  # no nodeview projection projection/selector that derives UI-facing data.
├── fixtures/  # Fixture data used by tests and validators.
│   └── worlds/  # World fixtures or world definitions.
│       └── allow.json  # allow data/config artifact.
├── gallery/  # Gallery publishing, filters, and identity hooks.
│   ├── GalleryFilters.jsx  # Gallery Filters module.
│   ├── galleryStore.js  # gallery Store state store or state container.
│   ├── generateThumbnail.js  # generate Thumbnail module.
│   ├── publishToGallery.js  # publish To Gallery module.
│   ├── tagUtils.js  # tag Utils module.
│   ├── useGalleryIdentity.js  # use Gallery Identity hook/helper for consuming or deriving feature state.
│   └── usePublishToServer.js  # use Publish To Server hook/helper for consuming or deriving feature state.
├── import/  # Import pipelines and format adapters.
│   ├── svg/  # svg directory.
│   │   └── parseSVG.js  # parse SVG module.
│   └── importJSON.js  # import JSON importer or import adapter.
├── infrastructure/  # Infra adapters such as buses and persistence registries.
│   ├── eventBus/  # Event bus implementations and adapters.
│   └── persistence/  # Persistence adapters, registries, and snapshot I/O.
│       ├── activeDocument.js  # active Document module.
│       ├── branching.js  # branching module.
│       ├── checkpoints.js  # checkpoints module.
│       ├── documentCommands.js  # document Commands module.
│       ├── documentFiles.js  # document Files module.
│       ├── documentRegistry.js  # document Registry registry/lookup table for feature definitions.
│       ├── documentSchema.js  # document Schema schema/type/contract definition.
│       ├── loadDocument.js  # load Document module.
│       ├── localDocumentSchema.js  # local Document Schema schema/type/contract definition.
│       ├── localDocumentStore.js  # local Document Store state store or state container.
│       ├── saveDocument.js  # save Document module.
│       ├── schema_v1.js  # schema v1 schema/type/contract definition.
│       └── useDocumentSnapshot.js  # use Document Snapshot hook/helper for consuming or deriving feature state.
├── inspector/  # Inspector UI sections and composition helpers.
│   ├── sections/  # Section components within a larger UI.
│   │   ├── AnimationInspector.jsx  # Animation Inspector animation helper or animation UI/runtime module.
│   │   ├── CommonInspector.jsx  # Common Inspector module.
│   │   ├── GraphicInspector.jsx  # Graphic Inspector module.
│   │   └── UIInspector.jsx  # UIInspector module.
│   └── InspectorSection.jsx  # Inspector Section module.
├── interaction/  # Older interaction controllers and rendering helpers.
│   ├── geometry/  # Geometry-specific math helpers.
│   │   └── computeBoundingBox.js  # compute Bounding Box module.
│   ├── guides/  # Guide generation and alignment/spacing guide logic.
│   │   ├── computeSnapPoints.js  # compute Snap Points module.
│   │   ├── GuideOverlay.js  # Guide Overlay overlay component rendered above the main surface.
│   │   └── snapPosition.js  # snap Position module.
│   ├── measurements/  # measurements directory.
│   │   ├── computeMeasurements.js  # compute Measurements module.
│   │   └── MeasurementOverlay.js  # Measurement Overlay overlay component rendered above the main surface.
│   ├── rulers/  # rulers directory.
│   │   ├── renderRulers.js  # render Rulers module.
│   │   └── RulerOverlay.js  # Ruler Overlay overlay component rendered above the main surface.
│   ├── hitTest.js  # hit Test module.
│   ├── InteractionController.js  # Interaction Controller module.
│   ├── KeyboardController.js  # Keyboard Controller module.
│   ├── renderResizeHandles.js  # render Resize Handles module.
│   ├── renderSelection.js  # render Selection module.
│   └── SelectionModel.js  # Selection Model module.
├── keys/  # Local key material and crypto fixtures.
│   ├── private.pem  # private static asset or key material.
│   └── public.pem  # public static asset or key material.
├── layout/  # Layout engine helpers and auto-layout modules.
│   └── autoLayoutEngine.js  # auto Layout Engine layout helper or layout pipeline module.
├── lib/  # Misc shared libraries and integrations.
│   └── agents/  # agents directory.
│       └── persistence/  # Persistence adapters, registries, and snapshot I/O.
│           └── messageBusPersistence.js  # message Bus Persistence module.
├── logs/  # Captured run logs and local debug artifacts.
│   ├── run-everything-20260328-151014.log  # run everything 20260328 151014 module.
│   └── run-everything-20260328-152137.log  # run everything 20260328 152137 module.
├── marketplace/  # Marketplace UI, schemas, filters, and mock data.
│   ├── lessons/  # Lesson pages, lesson data, and lesson marketplace routes.
│   │   ├── filterLessons.js  # filter Lessons module.
│   │   ├── lessonCollections.js  # lesson Collections module.
│   │   ├── LessonFilterBar.jsx  # Lesson Filter Bar module.
│   │   └── useLessonFilters.js  # use Lesson Filters hook/helper for consuming or deriving feature state.
│   ├── collections.js  # collections module.
│   ├── filterTemplates.js  # filter Templates template-related helper, UI, or validator.
│   ├── LessonListingSchema.js  # Lesson Listing Schema schema/type/contract definition.
│   ├── LessonVersionSchema.js  # Lesson Version Schema schema/type/contract definition.
│   ├── MarketplaceFilterBar.jsx  # Marketplace Filter Bar module.
│   ├── mockLessons.js  # mock Lessons module.
│   ├── mockTemplates.js  # mock Templates template-related helper, UI, or validator.
│   ├── ReviewSchema.js  # Review Schema schema/type/contract definition.
│   ├── TemplateCard.jsx  # Template Card template-related helper, UI, or validator.
│   ├── useMarketplaceFilters.js  # use Marketplace Filters hook/helper for consuming or deriving feature state.
│   └── useOwnershipStore.js  # use Ownership Store hook/helper for consuming or deriving feature state.
├── multiplayer/  # Classroom/broadcast multiplayer experiments.
│   ├── ClassroomSession.js  # Classroom Session module.
│   ├── ObserverReceiver.js  # Observer Receiver module.
│   ├── protocol.js  # protocol module.
│   └── TeacherBroadcaster.js  # Teacher Broadcaster module.
├── onboarding/  # Onboarding hints, state, and UX helpers.
│   ├── ModeHint.jsx  # Mode Hint module.
│   ├── modeHints.js  # mode Hints module.
│   ├── useModeOnboarding.js  # use Mode Onboarding hook/helper for consuming or deriving feature state.
│   └── useOnboardingState.js  # use Onboarding State hook/helper for consuming or deriving feature state.
├── perf/  # Performance HUDs and trackers.
│   ├── PerfHUD.jsx  # Perf HUD module.
│   └── perfTracker 2.js  # perf Tracker 2 module.
├── platform/  # Canonical platform registries, workspace resolution, and capability assembly.
│   ├── __tests__/  # Tests colocated with the owning module.
│   │   ├── capabilityEngine.test.mjs  # Automated test covering behavior in this area.
│   │   ├── pluginPlatform.test.mjs  # Automated test covering behavior in this area.
│   │   └── workspaceContext.test.mjs  # Automated test covering behavior in this area.
│   ├── capabilities/  # Capability registries, activation, and runtime wiring.
│   │   ├── capabilityContext.js  # capability Context React context and shared state surface.
│   │   ├── capabilityRegistry.js  # capability Registry registry/lookup table for feature definitions.
│   │   ├── capabilityResolver.js  # capability Resolver module.
│   │   ├── capabilityRuntime.js  # capability Runtime runtime logic for this feature.
│   │   ├── workspaceActivation.js  # workspace Activation workspace-specific entry, contract, or helper.
│   │   ├── workspacePolicy.js  # workspace Policy workspace-specific entry, contract, or helper.
│   │   └── workspaceRegistryBridge.js  # workspace Registry Bridge translation bridge between layers or buses.
│   ├── collaboration/  # Collaboration-specific supporting modules.
│   │   ├── collaborationSession.js  # collaboration Session module.
│   │   ├── conflictResolver.js  # conflict Resolver module.
│   │   ├── cursorRuntime.js  # cursor Runtime runtime logic for this feature.
│   │   ├── eventSyncEngine.js  # event Sync Engine event definition, adapter, or event helper.
│   │   └── presenceRuntime.js  # presence Runtime runtime logic for this feature.
│   ├── plugins/  # Plugin-related registries and execution support.
│   │   ├── pluginAPI.js  # plugin API plugin runtime or plugin support module.
│   │   ├── pluginHost.js  # plugin Host plugin runtime or plugin support module.
│   │   ├── pluginLoader.js  # plugin Loader plugin runtime or plugin support module.
│   │   ├── pluginRegistry.js  # plugin Registry registry/lookup table for feature definitions.
│   │   ├── pluginSandbox.js  # plugin Sandbox plugin runtime or plugin support module.
│   │   └── pluginTypes.js  # plugin Types schema/type/contract definition.
│   └── workspaces/  # Workspace-specific runtime, contracts, or helpers.
│       ├── canonicalRegistry.js  # canonical Registry registry/lookup table for feature definitions.
│       ├── canvasSurfacePolicy.js  # canvas Surface Policy canvas-related component or helper.
│       ├── createWorkspaceFromTemplate.js  # create Workspace From Template template-related helper, UI, or validator.
│       ├── index.js  # Barrel/export entry for the workspaces area.
│       ├── legacyMapping.js  # legacy Mapping module.
│       ├── mediaWorkspace.js  # media Workspace workspace-specific entry, contract, or helper.
│       ├── modeRegistry.js  # mode Registry registry/lookup table for feature definitions.
│       ├── modeResolution.js  # mode Resolution module.
│       ├── resolveWorkspaceContext.js  # resolve Workspace Context React context and shared state surface.
│       ├── workspaceEngine.js  # workspace Engine workspace-specific entry, contract, or helper.
│       └── workspaceRegistry.js  # workspace Registry registry/lookup table for feature definitions.
├── plugins/  # Plugin runtime, manifests, sandboxing, and permissions.
│   ├── capabilityFactory.js  # capability Factory module.
│   ├── executionGuards.js  # execution Guards invariant or permission guard.
│   ├── plugin-worker.js  # plugin worker plugin runtime or plugin support module.
│   ├── pluginAPI.js  # plugin API plugin runtime or plugin support module.
│   ├── pluginManifest.js  # plugin Manifest plugin runtime or plugin support module.
│   ├── pluginPerf.js  # plugin Perf plugin runtime or plugin support module.
│   ├── pluginPermissions.js  # plugin Permissions plugin runtime or plugin support module.
│   ├── pluginRegistry.js  # plugin Registry registry/lookup table for feature definitions.
│   ├── pluginSupervisor.js  # plugin Supervisor plugin runtime or plugin support module.
│   ├── securePluginAPI.js  # secure Plugin API plugin runtime or plugin support module.
│   ├── types.js  # types schema/type/contract definition.
│   └── workerSandbox.js  # worker Sandbox module.
├── profiles/  # Creator/profile UI and state.
│   ├── creatorStore.js  # creator Store state store or state container.
│   ├── currentCreator.js  # current Creator module.
│   ├── EditProfile.jsx  # Edit Profile profile UI or profile helper.
│   └── linkLocalCreator.js  # link Local Creator module.
├── projection/  # Projection helpers turning truth into view models.
│   └── timelineProjection.js  # timeline Projection projection/selector that derives UI-facing data.
├── providers/  # React provider composition.
│   └── ConvexProvider.jsx  # Convex Provider provider/composition component.
├── public/  # Static public assets served by Next.js.
│   ├── file.svg  # file static asset or key material.
│   ├── globe.svg  # globe static asset or key material.
│   ├── next.svg  # next static asset or key material.
│   ├── vercel.svg  # vercel static asset or key material.
│   └── window.svg  # window static asset or key material.
├── reports/  # Generated architecture and status reports.
│   ├── .gitkeep  #  module.
│   ├── architecture-phase-progress.json  # architecture phase progress data/config artifact.
│   ├── architecture-radar.json  # architecture radar data/config artifact.
│   ├── architecture-score.json  # architecture score data/config artifact.
│   └── architecture-status.json  # architecture status data/config artifact.
├── review/  # Review UI layouts and workflow surfaces.
│   ├── panels/  # Panel components grouped by feature.
│   │   ├── AnnotationPanel.jsx  # Annotation Panel panel component for a feature workspace.
│   │   ├── RubricPanel.jsx  # Rubric Panel panel component for a feature workspace.
│   │   └── SubmissionInfoPanel.jsx  # Submission Info Panel panel component for a feature workspace.
│   ├── AssessmentContent.jsx  # Assessment Content module.
│   ├── AssessmentReviewLayout.jsx  # Assessment Review Layout layout helper or layout pipeline module.
│   └── ReviewToolbar.jsx  # Review Toolbar toolbar component for feature controls.
├── runtime/  # Execution layer: dispatcher, state, guards, evaluation, projection, tools.
│   ├── __tests__/  # Tests colocated with the owning module.
│   │   ├── collectLayoutRoots.test.mjs  # Automated test covering behavior in this area.
│   │   ├── graphAuthoring.test.mjs  # Automated test covering behavior in this area.
│   │   ├── layoutCompilerRuntime.test.mjs  # Automated test covering behavior in this area.
│   │   ├── layoutConstraintRuntime.test.mjs  # Automated test covering behavior in this area.
│   │   ├── layoutFlowRuntime.test.mjs  # Automated test covering behavior in this area.
│   │   ├── layoutGridRuntime.test.mjs  # Automated test covering behavior in this area.
│   │   ├── layoutIncrementalRuntime.test.mjs  # Automated test covering behavior in this area.
│   │   ├── layoutResponsiveRuntime.test.mjs  # Automated test covering behavior in this area.
│   │   ├── layoutRuntimeAuthority.test.mjs  # Automated test covering behavior in this area.
│   │   ├── navigationRuntime.test.mjs  # Automated test covering behavior in this area.
│   │   ├── resizeSessionCommitBridge.test.mjs  # Automated test covering behavior in this area.
│   │   ├── resizeSessionDeterminism.test.mjs  # Automated test covering behavior in this area.
│   │   ├── rotateSessionDeterminism.test.mjs  # Automated test covering behavior in this area.
│   │   ├── runtimeReplayDeterminism.test.mjs  # Automated test covering behavior in this area.
│   │   ├── runtimeStateHash.test.mjs  # Automated test covering behavior in this area.
│   │   ├── selectionReducer.test.mjs  # Automated test covering behavior in this area.
│   │   ├── sessionCommitStructure.test.mjs  # Automated test covering behavior in this area.
│   │   ├── stateMachineRuntime.test.mjs  # Automated test covering behavior in this area.
│   │   ├── structureGuard.test.mjs  # Automated test covering behavior in this area.
│   │   └── wrapGuard.test.mjs  # Automated test covering behavior in this area.
│   ├── actions/  # Action creators and intent-to-event helpers.
│   │   └── toolActions.js  # tool Actions module.
│   ├── animation/  # Animation-specific runtime or engine modules.
│   │   ├── __tests__/  # Tests colocated with the owning module.
│   │   │   ├── applyGraphModifiers.test.mjs  # Automated test covering behavior in this area.
│   │   │   ├── applyStateMachineParameters.test.mjs  # Automated test covering behavior in this area.
│   │   │   ├── blendEngine.test.mjs  # Automated test covering behavior in this area.
│   │   │   ├── constraintStack.test.mjs  # Automated test covering behavior in this area.
│   │   │   ├── evaluateSceneAnimation.test.mjs  # Automated test covering behavior in this area.
│   │   │   ├── graphCompiler.test.mjs  # Automated test covering behavior in this area.
│   │   │   ├── graphCurve.test.mjs  # Automated test covering behavior in this area.
│   │   │   ├── graphEase.test.mjs  # Automated test covering behavior in this area.
│   │   │   ├── graphEvaluation.test.mjs  # Automated test covering behavior in this area.
│   │   │   ├── graphIK.test.mjs  # Automated test covering behavior in this area.
│   │   │   ├── graphNodes.test.mjs  # Automated test covering behavior in this area.
│   │   │   ├── graphNoise.test.mjs  # Automated test covering behavior in this area.
│   │   │   ├── graphRuntime.test.mjs  # Automated test covering behavior in this area.
│   │   │   ├── graphSpring.test.mjs  # Automated test covering behavior in this area.
│   │   │   ├── graphValidation.test.mjs  # Automated test covering behavior in this area.
│   │   │   ├── resolveAnimationLayers.test.mjs  # Automated test covering behavior in this area.
│   │   │   ├── resolveGraphParameters.test.mjs  # Automated test covering behavior in this area.
│   │   │   ├── resolveLayerAuthority.test.mjs  # Automated test covering behavior in this area.
│   │   │   ├── runAnimationPreview.test.js  # Automated test covering behavior in this area.
│   │   │   └── validateGraphParameters.test.mjs  # Automated test covering behavior in this area.
│   │   ├── blending/  # blending directory.
│   │   │   ├── blendChannels.js  # blend Channels module.
│   │   │   ├── blendEngine.js  # blend Engine module.
│   │   │   ├── blendLayers.js  # blend Layers module.
│   │   │   └── blendUtils.js  # blend Utils module.
│   │   ├── constraints/  # Constraint solvers and constraint evaluation code.
│   │   │   └── applyConstraintStack.js  # apply Constraint Stack module.
│   │   ├── exporters/  # exporters directory.
│   │   │   └── exportWebAnimation.js  # export Web Animation animation helper or animation UI/runtime module.
│   │   ├── graph/  # Graph authoring, graph evaluation, and graph views.
│   │   │   ├── applyGraphModifiers.js  # apply Graph Modifiers module.
│   │   │   ├── graphCompiler.js  # graph Compiler module.
│   │   │   ├── graphEvaluation.js  # graph Evaluation module.
│   │   │   ├── graphNodes.js  # graph Nodes module.
│   │   │   ├── graphRuntime.js  # graph Runtime runtime logic for this feature.
│   │   │   ├── graphValidation.js  # graph Validation module.
│   │   │   ├── resolveGraphParameters.js  # resolve Graph Parameters module.
│   │   │   ├── resolveLayerAuthority.js  # resolve Layer Authority module.
│   │   │   └── validateGraphParameters.js  # validate Graph Parameters module.
│   │   ├── layers/  # layers directory.
│   │   │   └── resolveAnimationLayers.js  # resolve Animation Layers animation helper or animation UI/runtime module.
│   │   ├── state/  # State models and state utilities.
│   │   │   └── applyStateMachineParameters.js  # apply State Machine Parameters module.
│   │   ├── animationController.js  # animation Controller animation helper or animation UI/runtime module.
│   │   ├── buildEvaluationInputs.fixture.test.mjs  # Automated test covering behavior in this area.
│   │   ├── buildEvaluationInputs.js  # build Evaluation Inputs module.
│   │   ├── buildEvaluationInputs.sequence.fixture.test.mjs  # Automated test covering behavior in this area.
│   │   ├── cancelAnimationPreview.js  # cancel Animation Preview animation helper or animation UI/runtime module.
│   │   ├── compileTimelineToIR.js  # compile Timeline To IR timeline-related helper or UI surface.
│   │   ├── easing.js  # easing module.
│   │   ├── evaluateAnimationFrame.js  # evaluate Animation Frame animation helper or animation UI/runtime module.
│   │   ├── evaluateSceneAnimation.js  # evaluate Scene Animation animation helper or animation UI/runtime module.
│   │   ├── interpolateNodes.js  # interpolate Nodes module.
│   │   ├── playbackController.js  # playback Controller module.
│   │   ├── README.md  # Module-level documentation and orientation for this area.
│   │   └── runAnimationPreview.js  # run Animation Preview animation helper or animation UI/runtime module.
│   ├── appRuntime/  # app Runtime directory.
│   │   ├── index.js  # Barrel/export entry for the appRuntime area.
│   │   ├── navigation.js  # navigation module.
│   │   └── stateMachine.js  # state Machine module.
│   ├── attachments/  # Attachment handling and related runtime helpers.
│   │   ├── applyAttachments.js  # apply Attachments module.
│   │   └── attachmentRegistry.js  # attachment Registry registry/lookup table for feature definitions.
│   ├── boundary/  # Layer-boundary providers and integration points.
│   │   ├── DispatcherContext.jsx  # Dispatcher Context React context and shared state surface.
│   │   └── DispatcherProvider.jsx  # Dispatcher Provider provider/composition component.
│   ├── bridge/  # bridge directory.
│   ├── canvas/  # Canvas rendering and canvas-surface code.
│   │   └── zoomTiers.js  # zoom Tiers module.
│   ├── capabilities/  # Capability registries, activation, and runtime wiring.
│   │   ├── __tests__/  # Tests colocated with the owning module.
│   │   │   └── toolRegistrationRuntime.test.mjs  # Automated test covering behavior in this area.
│   │   └── toolRegistrationRuntime.js  # tool Registration Runtime runtime logic for this feature.
│   ├── characters/  # characters directory.
│   │   ├── applyCharacterConstraints.js  # apply Character Constraints module.
│   │   ├── characterRegistry.js  # character Registry registry/lookup table for feature definitions.
│   │   └── useCharacterRenderNodes.js  # use Character Render Nodes hook/helper for consuming or deriving feature state.
│   ├── choreography/  # Choreography/runtime sequencing helpers.
│   │   ├── __tests__/  # Tests colocated with the owning module.
│   │   │   └── evaluateChoreography.test.mjs  # Automated test covering behavior in this area.
│   │   ├── combatTemplates.js  # combat Templates template-related helper, UI, or validator.
│   │   ├── evaluateChoreography.js  # evaluate Choreography module.
│   │   └── generateCombatAnimation.js  # generate Combat Animation animation helper or animation UI/runtime module.
│   ├── clipboard/  # Clipboard runtime and clipboard actions.
│   │   ├── clipboardProjection.js  # clipboard Projection projection/selector that derives UI-facing data.
│   │   ├── clipboardStore.js  # clipboard Store state store or state container.
│   │   ├── copySelection.js  # copy Selection module.
│   │   ├── duplicateSelection.js  # duplicate Selection module.
│   │   └── pasteClipboard.js  # paste Clipboard module.
│   ├── clock/  # Clock, playback, and time-control code.
│   │   ├── __tests__/  # Tests colocated with the owning module.
│   │   │   └── clockSceneScope.test.js  # Automated test covering behavior in this area.
│   │   ├── clock.js  # clock module.
│   │   ├── clockController.js  # clock Controller module.
│   │   └── clockSystemHandlers.js  # clock System Handlers module.
│   ├── commands/  # Command handling and command registries.
│   │   ├── scene/  # Scene graph and scene-specific helpers.
│   │   │   ├── __tests__/  # Tests colocated with the owning module.
│   │   ├── structure/  # Structure rules, tree edits, and structural helpers.
│   │   │   ├── moveNode.js  # move Node module.
│   │   │   ├── unwrapNode.js  # unwrap Node module.
│   │   │   └── wrapSelection.js  # wrap Selection module.
│   │   └── hydrateRuntimeSnapshot.js  # hydrate Runtime Snapshot runtime logic for this feature.
│   ├── compiler/  # Compilation and normalization logic.
│   │   └── layout/  # Layout pipelines, layout pass logic, and layout helpers.
│   │       ├── compileBreakpoints.js  # compile Breakpoints module.
│   │       ├── compileConstraints.js  # compile Constraints module.
│   │       ├── compileLayoutSystems.js  # compile Layout Systems layout helper or layout pipeline module.
│   │       └── compileResponsiveLayout.js  # compile Responsive Layout layout helper or layout pipeline module.
│   ├── components/  # Reusable components or runtime component evaluation.
│   │   ├── componentEvaluation.js  # component Evaluation module.
│   │   ├── componentProjection.js  # component Projection projection/selector that derives UI-facing data.
│   │   ├── index.js  # Barrel/export entry for the components area.
│   │   ├── instanceResolver.js  # instance Resolver module.
│   │   └── overrideResolver.js  # override Resolver module.
│   ├── constraints/  # Constraint solvers and constraint evaluation code.
│   │   ├── applyConstraints.js  # apply Constraints module.
│   │   ├── computeConstraints.js  # compute Constraints module.
│   │   └── constraintProjection.js  # constraint Projection projection/selector that derives UI-facing data.
│   ├── cursor/  # Cursor state and cursor runtime helpers.
│   │   ├── createCursor.js  # create Cursor module.
│   │   └── resolveCursor.js  # resolve Cursor module.
│   ├── data/  # Data runtime and data evaluation code.
│   │   ├── bindings.js  # bindings module.
│   │   ├── computedValues.js  # computed Values module.
│   │   └── index.js  # Barrel/export entry for the data area.
│   ├── dispatcher/  # Dispatcher implementation and mutation funnel code.
│   │   ├── ux/  # ux directory.
│   │   │   ├── emitUXWarning.js  # emit UXWarning module.
│   │   │   ├── observeUXIntent.js  # observe UXIntent intent emitter or intent translation helper.
│   │   │   ├── shouldConfirmUXAction.js  # should Confirm UXAction module.
│   │   │   ├── uxAuditLog.js  # ux Audit Log module.
│   │   │   ├── uxConfirmBus.js  # ux Confirm Bus module.
│   │   │   ├── uxIntentMap.js  # ux Intent Map intent emitter or intent translation helper.
│   │   │   └── uxWarningBus.js  # ux Warning Bus module.
│   │   ├── dispatch.js  # dispatch dispatcher or mutation-funnel implementation.
│   │   ├── dispatcherHandle.js  # dispatcher Handle dispatcher or mutation-funnel implementation.
│   │   └── replayEvents.js  # replay Events event definition, adapter, or event helper.
│   ├── document/  # Document model, document adapters, and boot helpers.
│   │   ├── documentAdapter.js  # document Adapter module.
│   │   └── documentAdapter.ts  # document Adapter module.
│   ├── evaluation/  # Evaluation pipeline and derived-runtime computation.
│   │   └── index.js  # Barrel/export entry for the evaluation area.
│   ├── events/  # Event definitions, apply/replay helpers, and sequencing.
│   │   ├── createEventId.js  # create Event Id event definition, adapter, or event helper.
│   │   ├── emitLayoutUpdate.js  # emit Layout Update layout helper or layout pipeline module.
│   │   ├── EventSequencer.js  # Event Sequencer event definition, adapter, or event helper.
│   │   └── getEventsUpToCursor.js  # get Events Up To Cursor event definition, adapter, or event helper.
│   ├── export/  # Export logic and export-related UI/runtime code.
│   │   ├── __tests__/  # Tests colocated with the owning module.
│   │   │   └── exportDroppleSpec.test.js  # Automated test covering behavior in this area.
│   │   ├── animation/  # Animation-specific runtime or engine modules.
│   │   │   ├── __tests__/  # Tests colocated with the owning module.
│   │   │   ├── css/  # css directory.
│   │   │   ├── waapi/  # waapi directory.
│   │   │   ├── exportAnimation.js  # export Animation animation helper or animation UI/runtime module.
│   │   │   └── normalizeAnimationExport.js  # normalize Animation Export animation helper or animation UI/runtime module.
│   │   ├── css/  # css directory.
│   │   │   └── exportCSS.js  # export CSS export helper or export pipeline module.
│   │   ├── png/  # png directory.
│   │   │   └── exportPNG.js  # export PNG export helper or export pipeline module.
│   │   ├── static/  # static directory.
│   │   │   ├── buildStaticHTML.js  # build Static HTML module.
│   │   │   └── exportStaticHTML.js  # export Static HTML export helper or export pipeline module.
│   │   ├── svg/  # svg directory.
│   │   │   ├── exportSVG.js  # export SVG export helper or export pipeline module.
│   │   │   └── renderNodeToSVG.js  # render Node To SVG module.
│   │   ├── utils/  # Small support utilities.
│   │   │   └── download.js  # download module.
│   │   ├── verify/  # verify directory.
│   │   │   ├── verifyCssKeyframes.js  # verify Css Keyframes module.
│   │   │   ├── verifyMotionExport.js  # verify Motion Export export helper or export pipeline module.
│   │   │   └── verifyWaapiOutput.js  # verify Waapi Output module.
│   │   ├── waapi/  # waapi directory.
│   │   │   └── exportWAAPI.js  # export WAAPI export helper or export pipeline module.
│   │   ├── wordpress/  # wordpress directory.
│   │   │   ├── buildWordPressTheme.js  # build Word Press Theme module.
│   │   │   └── exportWordPress.js  # export Word Press export helper or export pipeline module.
│   │   ├── buildDroppleSpec.js  # build Dropple Spec module.
│   │   ├── deriveEdgesFromNodes.js  # derive Edges From Nodes module.
│   │   ├── diffLines.js  # diff Lines module.
│   │   ├── evaluateAnimationForExport.js  # evaluate Animation For Export animation helper or animation UI/runtime module.
│   │   ├── executeExport.js  # execute Export export helper or export pipeline module.
│   │   ├── ExportDiffViewer.jsx  # Export Diff Viewer export helper or export pipeline module.
│   │   ├── exportDroppleSpec.js  # export Dropple Spec export helper or export pipeline module.
│   │   ├── exportGate.js  # export Gate export helper or export pipeline module.
│   │   ├── exportGateHeadless.js  # export Gate Headless export helper or export pipeline module.
│   │   ├── exportGateStatus.js  # export Gate Status export helper or export pipeline module.
│   │   ├── exportJSON.js  # export JSON export helper or export pipeline module.
│   │   ├── exportMetadata.js  # export Metadata export helper or export pipeline module.
│   │   ├── exportModes.js  # export Modes export helper or export pipeline module.
│   │   ├── exportMotion.js  # export Motion export helper or export pipeline module.
│   │   ├── generateExportPair.js  # generate Export Pair export helper or export pipeline module.
│   │   ├── normalizeExport.js  # normalize Export export helper or export pipeline module.
│   │   └── validateDroppleSpec.js  # validate Dropple Spec module.
│   ├── frame/  # Frame-level runtime helpers.
│   │   ├── adapters/  # adapters directory.
│   │   │   └── renderGraphToCanvas.js  # render Graph To Canvas canvas-related component or helper.
│   │   ├── stages/  # stages directory.
│   │   │   ├── __tests__/  # Tests colocated with the owning module.
│   │   │   ├── applyPreviewTransforms.js  # apply Preview Transforms module.
│   │   │   ├── applySessionPreview.js  # apply Session Preview module.
│   │   │   ├── applyViewportTransform.js  # apply Viewport Transform module.
│   │   │   ├── buildRenderGraph.js  # build Render Graph module.
│   │   │   ├── buildSelectionOverlay.js  # build Selection Overlay overlay component rendered above the main surface.
│   │   │   ├── collectInput.js  # collect Input module.
│   │   │   ├── computeGuides.js  # compute Guides module.
│   │   │   ├── computeLayoutInference.js  # compute Layout Inference layout helper or layout pipeline module.
│   │   │   ├── evaluateTimeline.js  # evaluate Timeline timeline-related helper or UI surface.
│   │   │   └── processDispatcherQueue.js  # process Dispatcher Queue dispatcher or mutation-funnel implementation.
│   │   ├── frameContext.js  # frame Context React context and shared state surface.
│   │   ├── renderFrame.js  # render Frame module.
│   │   ├── runEditorFrame.js  # run Editor Frame module.
│   │   ├── runFramePipeline.js  # run Frame Pipeline module.
│   │   └── testFrameRender.js  # test Frame Render module.
│   ├── geometry/  # Geometry-specific math helpers.
│   ├── graph/  # Graph authoring, graph evaluation, and graph views.
│   │   ├── graphInteractionEvents.js  # graph Interaction Events event definition, adapter, or event helper.
│   │   ├── graphInteractionReducer.js  # graph Interaction Reducer module.
│   │   ├── graphInteractionSelectors.js  # graph Interaction Selectors projection/selector that derives UI-facing data.
│   │   └── index.js  # Barrel/export entry for the graph area.
│   ├── grouping/  # grouping directory.
│   │   ├── groupProjection.js  # group Projection projection/selector that derives UI-facing data.
│   │   ├── groupSelection.js  # group Selection module.
│   │   └── ungroupSelection.js  # ungroup Selection module.
│   ├── guards/  # Guards enforcing invariants before mutation or evaluation.
│   │   ├── animationGuard.js  # animation Guard invariant or permission guard.
│   │   ├── authorityGuard.js  # authority Guard invariant or permission guard.
│   │   ├── structureGuard.js  # structure Guard invariant or permission guard.
│   │   └── timelineGuard.js  # timeline Guard invariant or permission guard.
│   ├── guides/  # Guide generation and alignment/spacing guide logic.
│   │   ├── __tests__/  # Tests colocated with the owning module.
│   │   │   └── guideProjection.test.mjs  # Automated test covering behavior in this area.
│   │   ├── computeGuides.js  # compute Guides module.
│   │   ├── computeSpacingGuides.js  # compute Spacing Guides module.
│   │   └── guideProjection.js  # guide Projection projection/selector that derives UI-facing data.
│   ├── hitTest/  # Hit-testing and picking logic.
│   │   ├── __tests__/  # Tests colocated with the owning module.
│   │   │   └── hitTest.test.js  # Automated test covering behavior in this area.
│   │   ├── filterCandidatesByPartitions.js  # filter Candidates By Partitions module.
│   │   ├── filterVisibleNodes.js  # filter Visible Nodes module.
│   │   ├── hitTestBounds.js  # hit Test Bounds module.
│   │   ├── hitTestPoint.js  # hit Test Point module.
│   │   ├── index.js  # Barrel/export entry for the hitTest area.
│   │   ├── resolveHitTest.js  # resolve Hit Test module.
│   │   └── resolveTopNode.js  # resolve Top Node module.
│   ├── hooks/  # React hooks or runtime hook wrappers.
│   │   ├── runtimeInstrumentation.js  # runtime Instrumentation runtime logic for this feature.
│   │   └── useTools.js  # use Tools hook/helper for consuming or deriving feature state.
│   ├── init/  # init directory.
│   │   └── registerRuntimeSystemHandlers.js  # register Runtime System Handlers runtime logic for this feature.
│   ├── input/  # Input translation from UI intents into runtime events.
│   │   ├── __tests__/  # Tests colocated with the owning module.
│   │   │   └── inputEngine.test.mjs  # Automated test covering behavior in this area.
│   │   ├── snap/  # snap directory.
│   │   │   └── snapConfig.js  # snap Config module.
│   │   ├── spatial/  # Spatial indexing and world-space helpers.
│   │   │   └── nearestSnapshot.js  # nearest Snapshot module.
│   │   ├── animationKeyframeRuntimeBridge.js  # animation Keyframe Runtime Bridge translation bridge between layers or buses.
│   │   ├── editEventRuntimeBridge.js  # edit Event Runtime Bridge translation bridge between layers or buses.
│   │   ├── groupSessionRuntimeBridge.js  # group Session Runtime Bridge translation bridge between layers or buses.
│   │   ├── inputEngine.js  # input Engine module.
│   │   ├── inputPolicy.js  # input Policy module.
│   │   ├── keyboardEngine.js  # keyboard Engine module.
│   │   ├── layoutConvertRuntimeBridge.js  # layout Convert Runtime Bridge translation bridge between layers or buses.
│   │   ├── nodeCreateRuntimeBridge.js  # node Create Runtime Bridge translation bridge between layers or buses.
│   │   ├── nodeDragRuntimeBridge.js  # node Drag Runtime Bridge translation bridge between layers or buses.
│   │   ├── sessionCommitRuntimeBridge.js  # session Commit Runtime Bridge translation bridge between layers or buses.
│   │   └── sessionRuntimeBridge.js  # session Runtime Bridge translation bridge between layers or buses.
│   ├── instrumentation/  # Perf markers and instrumentation helpers.
│   │   ├── perfEvents.js  # perf Events event definition, adapter, or event helper.
│   │   └── perfTracker.js  # perf Tracker module.
│   ├── interaction/  # Interaction runtime, drag sessions, and pointer logic.
│   │   ├── __tests__/  # Tests colocated with the owning module.
│   │   │   ├── dragEngine.test.mjs  # Automated test covering behavior in this area.
│   │   │   ├── dragRuntime.test.mjs  # Automated test covering behavior in this area.
│   │   │   ├── groupBoundsEngine.test.mjs  # Automated test covering behavior in this area.
│   │   │   ├── groupDragState.test.mjs  # Automated test covering behavior in this area.
│   │   │   ├── groupMoveEngine.test.mjs  # Automated test covering behavior in this area.
│   │   │   ├── groupSnapContext.test.mjs  # Automated test covering behavior in this area.
│   │   │   ├── magneticRotation.test.mjs  # Automated test covering behavior in this area.
│   │   │   ├── magneticSnap.test.mjs  # Automated test covering behavior in this area.
│   │   │   ├── resizeEngine.test.mjs  # Automated test covering behavior in this area.
│   │   │   ├── rotationEngine.test.mjs  # Automated test covering behavior in this area.
│   │   │   ├── shotSnapEngine.test.mjs  # Automated test covering behavior in this area.
│   │   │   ├── shotTimelineInteraction.test.mjs  # Automated test covering behavior in this area.
│   │   │   ├── shotTrackOverlapPolicy.test.mjs  # Automated test covering behavior in this area.
│   │   │   ├── shotTransitionConstraints.test.mjs  # Automated test covering behavior in this area.
│   │   │   └── snapAngle.test.mjs  # Automated test covering behavior in this area.
│   │   ├── dragEngine.js  # drag Engine module.
│   │   ├── dragRuntime.js  # drag Runtime runtime logic for this feature.
│   │   ├── groupBoundsEngine.js  # group Bounds Engine module.
│   │   ├── groupMoveEngine.js  # group Move Engine module.
│   │   ├── groupSnapContext.js  # group Snap Context React context and shared state surface.
│   │   ├── magneticRotation.js  # magnetic Rotation module.
│   │   ├── magneticSnap.js  # magnetic Snap module.
│   │   ├── resizeEngine.js  # resize Engine module.
│   │   ├── rotationEngine.js  # rotation Engine module.
│   │   ├── shotSnapEngine.js  # shot Snap Engine module.
│   │   ├── shotTimelineInteraction.js  # shot Timeline Interaction timeline-related helper or UI surface.
│   │   ├── shotTrackOverlapPolicy.js  # shot Track Overlap Policy module.
│   │   ├── shotTransitionConstraints.js  # shot Transition Constraints module.
│   │   ├── snapAngle.js  # snap Angle module.
│   │   ├── snapEngine.js  # snap Engine module.
│   │   └── snapResolver.js  # snap Resolver module.
│   ├── interactionEngine/  # Higher-level input engine orchestration.
│   │   ├── state/  # State models and state utilities.
│   │   │   ├── interactionState.js  # interaction State module.
│   │   │   └── previewState.js  # preview State module.
│   │   ├── engine.js  # engine module.
│   │   ├── graphExecutor.js  # graph Executor module.
│   │   ├── index.js  # Barrel/export entry for the interactionEngine area.
│   │   ├── intentResolver.js  # intent Resolver intent emitter or intent translation helper.
│   │   ├── interactionGraph.js  # interaction Graph module.
│   │   └── interactionRegistry.js  # interaction Registry registry/lookup table for feature definitions.
│   ├── interactions/  # Interaction models, pure interaction logic, or UI integration.
│   │   ├── input/  # Input translation from UI intents into runtime events.
│   │   │   ├── sessions/  # Session-scoped UI/runtime modules.
│   │   │   ├── InputSessionManager.js  # Input Session Manager module.
│   │   │   ├── pointerMap.js  # pointer Map module.
│   │   │   └── types.js  # types schema/type/contract definition.
│   │   ├── index.js  # Barrel/export entry for the interactions area.
│   │   ├── interactionManager.js  # interaction Manager module.
│   │   └── resolveInteraction.js  # resolve Interaction module.
│   ├── layout/  # Layout pipelines, layout pass logic, and layout helpers.
│   │   ├── __tests__/  # Tests colocated with the owning module.
│   │   │   ├── evaluateLayoutRoots.test.js  # Automated test covering behavior in this area.
│   │   │   └── resolveLayoutRoots.test.js  # Automated test covering behavior in this area.
│   │   ├── applyLayoutPass.js  # apply Layout Pass layout helper or layout pipeline module.
│   │   ├── collectLayoutRoots.js  # collect Layout Roots layout helper or layout pipeline module.
│   │   ├── computeFlexLayout.js  # compute Flex Layout layout helper or layout pipeline module.
│   │   ├── computeGridLayout.js  # compute Grid Layout layout helper or layout pipeline module.
│   │   ├── computeIsAutoLayoutChild.js  # compute Is Auto Layout Child layout helper or layout pipeline module.
│   │   ├── evaluateLayoutIncremental.js  # evaluate Layout Incremental layout helper or layout pipeline module.
│   │   ├── evaluateLayoutRoots.js  # evaluate Layout Roots layout helper or layout pipeline module.
│   │   ├── index.js  # Barrel/export entry for the layout area.
│   │   ├── isAutoLayoutChild.js  # is Auto Layout Child layout helper or layout pipeline module.
│   │   ├── layoutConstraintSolver.js  # layout Constraint Solver layout helper or layout pipeline module.
│   │   ├── resolveLayoutRoots.js  # resolve Layout Roots layout helper or layout pipeline module.
│   │   ├── responsiveLayoutRuntime.js  # responsive Layout Runtime runtime logic for this feature.
│   │   └── shouldRunLayout.js  # should Run Layout layout helper or layout pipeline module.
│   ├── macro/  # Macro helpers and batch command logic.
│   │   └── macroRecorder.js  # macro Recorder module.
│   ├── math/  # Pure math helpers.
│   │   └── matrix2d.js  # matrix2d module.
│   ├── navigation/  # Navigation runtime and navigation helpers.
│   │   ├── index.js  # Barrel/export entry for the navigation area.
│   │   ├── navigationReducer.js  # navigation Reducer module.
│   │   ├── navigationRegistry.js  # navigation Registry registry/lookup table for feature definitions.
│   │   ├── navigationRuntime.js  # navigation Runtime runtime logic for this feature.
│   │   └── navigationSelectors.js  # navigation Selectors projection/selector that derives UI-facing data.
│   ├── nodes/  # Node models, evaluators, or node-specific helpers.
│   │   └── generateNodeId.js  # generate Node Id module.
│   ├── persistence/  # Persistence adapters, registries, and snapshot I/O.
│   │   ├── appendEventsRuntimeBridge.js  # append Events Runtime Bridge translation bridge between layers or buses.
│   │   ├── appendRuntimeEvents.js  # append Runtime Events runtime logic for this feature.
│   │   ├── saveCurrentDocument.js  # save Current Document module.
│   │   ├── saveDocumentRuntimeBridge.js  # save Document Runtime Bridge translation bridge between layers or buses.
│   │   ├── useAutosaveRuntime.js  # use Autosave Runtime hook/helper for consuming or deriving feature state.
│   │   ├── worldRuntimeBridge.js  # world Runtime Bridge translation bridge between layers or buses.
│   │   ├── worldState.js  # world State module.
│   │   └── worldStore.js  # world Store state store or state container.
│   ├── policies/  # Policy rules and policy registries.
│   │   └── interactionPolicy.js  # interaction Policy module.
│   ├── preview/  # Preview runtime and non-committed visual state.
│   │   ├── applyTimelinePreview.js  # apply Timeline Preview timeline-related helper or UI surface.
│   │   ├── getTransitionForPreview.js  # get Transition For Preview module.
│   │   ├── index.js  # Barrel/export entry for the preview area.
│   │   ├── runTransitionPreview.js  # run Transition Preview module.
│   │   └── timelineScrubber.js  # timeline Scrubber timeline-related helper or UI surface.
│   ├── projection/  # Projection/selectors turning state into UI-facing views.
│   │   ├── __tests__/  # Tests colocated with the owning module.
│   │   │   └── groupTransformProjection.test.mjs  # Automated test covering behavior in this area.
│   │   ├── selectors/  # State selectors and read-model helpers.
│   │   │   ├── __tests__/  # Tests colocated with the owning module.
│   │   │   ├── appSelectors.js  # app Selectors projection/selector that derives UI-facing data.
│   │   │   ├── graphSelectors.js  # graph Selectors projection/selector that derives UI-facing data.
│   │   │   ├── index.js  # Barrel/export entry for the selectors area.
│   │   │   ├── mediaSelectors.js  # media Selectors projection/selector that derives UI-facing data.
│   │   │   ├── rigControllerOverlaySelectors.js  # rig Controller Overlay Selectors projection/selector that derives UI-facing data.
│   │   │   ├── rigControllerSelectors.js  # rig Controller Selectors projection/selector that derives UI-facing data.
│   │   │   ├── rigSelectors.js  # rig Selectors projection/selector that derives UI-facing data.
│   │   │   ├── runtimeSelectors.js  # runtime Selectors runtime logic for this feature.
│   │   │   ├── sceneSelectors.js  # scene Selectors projection/selector that derives UI-facing data.
│   │   │   ├── sequenceRuntimeSelectors.js  # sequence Runtime Selectors runtime logic for this feature.
│   │   │   ├── sequenceSelectors.js  # sequence Selectors projection/selector that derives UI-facing data.
│   │   │   └── shotTimelineSelectors.js  # shot Timeline Selectors projection/selector that derives UI-facing data.
│   │   ├── v1/  # v1 directory.
│   │   │   ├── index.js  # Barrel/export entry for the v1 area.
│   │   │   ├── runtimeSnapshot.js  # runtime Snapshot runtime logic for this feature.
│   │   │   ├── selectors.js  # selectors projection/selector that derives UI-facing data.
│   │   │   ├── useWorkspaceProjection.js  # use Workspace Projection hook/helper for consuming or deriving feature state.
│   │   │   ├── uxAuditProjection.js  # ux Audit Projection projection/selector that derives UI-facing data.
│   │   │   └── workspaceProjection.js  # workspace Projection projection/selector that derives UI-facing data.
│   │   ├── evaluateTimelinePreview.js  # evaluate Timeline Preview timeline-related helper or UI surface.
│   │   ├── groupTransformProjection.js  # group Transform Projection projection/selector that derives UI-facing data.
│   │   ├── index.js  # Barrel/export entry for the projection area.
│   │   ├── nonReactProjection.js  # non React Projection projection/selector that derives UI-facing data.
│   │   ├── projectStateAtTime.js  # project State At Time module.
│   │   ├── runtimeBridgeBus.js  # runtime Bridge Bus translation bridge between layers or buses.
│   │   ├── selectRenderState.js  # select Render State module.
│   │   ├── timelineProjection.js  # timeline Projection projection/selector that derives UI-facing data.
│   │   ├── useWorkspaceViewState.js  # use Workspace View State hook/helper for consuming or deriving feature state.
│   │   ├── useWorkspaceVisualState.js  # use Workspace Visual State hook/helper for consuming or deriving feature state.
│   │   ├── useWorkspaceVisualState.jsx  # use Workspace Visual State hook/helper for consuming or deriving feature state.
│   │   ├── uxAuditProjection.js  # ux Audit Projection projection/selector that derives UI-facing data.
│   │   └── zustandBridge.js  # zustand Bridge translation bridge between layers or buses.
│   ├── registry/  # Registry/lookup modules.
│   │   └── engineRegistry.js  # engine Registry registry/lookup table for feature definitions.
│   ├── replay/  # Replay logic and determinism helpers.
│   │   ├── __tests__/  # Tests colocated with the owning module.
│   │   │   └── animationPreviewReplay.test.js  # Automated test covering behavior in this area.
│   │   ├── getDesignStateAtCursor.js  # get Design State At Cursor module.
│   │   ├── replayBranch.js  # replay Branch module.
│   │   └── useReplayState.js  # use Replay State hook/helper for consuming or deriving feature state.
│   ├── rigging/  # Rigging runtime and rigging authoring logic.
│   │   ├── __tests__/  # Tests colocated with the owning module.
│   │   │   ├── evaluateRig.test.mjs  # Automated test covering behavior in this area.
│   │   │   ├── rigControllerOverlaySelectors.test.mjs  # Automated test covering behavior in this area.
│   │   │   ├── rigControllerSelectors.test.mjs  # Automated test covering behavior in this area.
│   │   │   └── rigSelectors.test.mjs  # Automated test covering behavior in this area.
│   │   ├── constraints/  # Constraint solvers and constraint evaluation code.
│   │   │   └── parentConstraint.js  # parent Constraint module.
│   │   ├── evaluation/  # Evaluation pipeline and derived-runtime computation.
│   │   │   ├── evaluateRig.js  # evaluate Rig module.
│   │   │   └── solveConstraints.js  # solve Constraints module.
│   │   └── rigRegistry.js  # rig Registry registry/lookup table for feature definitions.
│   ├── scene/  # Scene graph and scene-specific helpers.
│   │   ├── __tests__/  # Tests colocated with the owning module.
│   │   │   ├── dirtyDomains.test.js  # Automated test covering behavior in this area.
│   │   │   ├── evaluateSceneIncremental.test.js  # Automated test covering behavior in this area.
│   │   │   ├── extractActiveSceneTree.test.js  # Automated test covering behavior in this area.
│   │   │   ├── layoutRootIndex.test.js  # Automated test covering behavior in this area.
│   │   │   ├── partitions.test.js  # Automated test covering behavior in this area.
│   │   │   ├── propagateDirtyNodes.test.js  # Automated test covering behavior in this area.
│   │   │   ├── sceneCache.test.js  # Automated test covering behavior in this area.
│   │   │   └── scheduler.test.js  # Automated test covering behavior in this area.
│   │   ├── graph/  # Graph authoring, graph evaluation, and graph views.
│   │   │   ├── buildSegmentGraph.js  # build Segment Graph module.
│   │   │   └── buildSegments.js  # build Segments module.
│   │   ├── partition/  # partition directory.
│   │   │   ├── assignNodeToPartition.js  # assign Node To Partition module.
│   │   │   ├── buildScenePartitions.js  # build Scene Partitions module.
│   │   │   ├── collectDirtyPartitions.js  # collect Dirty Partitions module.
│   │   │   ├── collectVisiblePartitions.js  # collect Visible Partitions module.
│   │   │   ├── partitionDependencyGraph.js  # partition Dependency Graph module.
│   │   │   ├── partitionProjection.js  # partition Projection projection/selector that derives UI-facing data.
│   │   │   └── updatePartitionBounds.js  # update Partition Bounds module.
│   │   ├── scheduler/  # scheduler directory.
│   │   │   ├── defaultScheduler.js  # default Scheduler module.
│   │   │   ├── evaluateSegment.js  # evaluate Segment module.
│   │   │   ├── frontierSchedule.js  # frontier Schedule module.
│   │   │   ├── frontierSegmentSchedule.js  # frontier Segment Schedule module.
│   │   │   ├── orderAffectedNodes.js  # order Affected Nodes module.
│   │   │   ├── partitionTask.js  # partition Task module.
│   │   │   └── schedulePartitions.js  # schedule Partitions module.
│   │   ├── buildDependencyGraph.js  # build Dependency Graph module.
│   │   ├── buildEvaluationLayers.js  # build Evaluation Layers module.
│   │   ├── collectDirtyNodes.js  # collect Dirty Nodes module.
│   │   ├── computeDirtyNodes.js  # compute Dirty Nodes module.
│   │   ├── computeLocalTransform.js  # compute Local Transform module.
│   │   ├── computeWorldBounds.js  # compute World Bounds module.
│   │   ├── evaluateNode.js  # evaluate Node module.
│   │   ├── evaluateSceneIncremental.js  # evaluate Scene Incremental module.
│   │   ├── extractActiveSceneTree.js  # extract Active Scene Tree module.
│   │   ├── index.js  # Barrel/export entry for the scene area.
│   │   ├── layoutRootIndex.js  # layout Root Index layout helper or layout pipeline module.
│   │   ├── markDirtyDomain.js  # mark Dirty Domain module.
│   │   ├── orderDirtyNodes.js  # order Dirty Nodes module.
│   │   ├── propagateDirtyNodes.js  # propagate Dirty Nodes module.
│   │   ├── resolveShotForTime.js  # resolve Shot For Time module.
│   │   ├── sceneCache.js  # scene Cache module.
│   │   └── topologicalSort.js  # topological Sort module.
│   ├── selection/  # Selection state, selection logic, and selection UI.
│   │   ├── clearSelection.js  # clear Selection module.
│   │   ├── selectBounds.js  # select Bounds module.
│   │   ├── selectionProjection.js  # selection Projection projection/selector that derives UI-facing data.
│   │   ├── selectionReducer.js  # selection Reducer module.
│   │   ├── selectNode.js  # select Node module.
│   │   ├── setSelection.js  # set Selection module.
│   │   ├── toggleNode.js  # toggle Node module.
│   │   └── validateSelection.js  # validate Selection module.
│   ├── selectionBounds/  # Selection bounds derivation and projection.
│   │   ├── computeSelectionBounds.js  # compute Selection Bounds module.
│   │   ├── getSelectionNodes.js  # get Selection Nodes module.
│   │   ├── selectionBoundsProjection.js  # selection Bounds Projection projection/selector that derives UI-facing data.
│   │   └── unionBounds.js  # union Bounds module.
│   ├── selectors/  # State selectors and read-model helpers.
│   │   └── toolSelectors.js  # tool Selectors projection/selector that derives UI-facing data.
│   ├── sequencer/  # Sequencing/orchestration for playback or events.
│   │   ├── __tests__/  # Tests colocated with the owning module.
│   │   │   ├── evaluateSequence.test.mjs  # Automated test covering behavior in this area.
│   │   │   └── sequenceSelectors.test.mjs  # Automated test covering behavior in this area.
│   │   ├── evaluation/  # Evaluation pipeline and derived-runtime computation.
│   │   │   ├── evaluateSequence.js  # evaluate Sequence module.
│   │   │   ├── evaluateSequenceAtTime.js  # evaluate Sequence At Time module.
│   │   │   ├── resolveActiveCamera.js  # resolve Active Camera module.
│   │   │   └── resolveActiveClips.js  # resolve Active Clips module.
│   │   └── sequenceRegistry.js  # sequence Registry registry/lookup table for feature definitions.
│   ├── snapping/  # Snapping logic and snap target resolution.
│   │   ├── computeAlignmentGuides.js  # compute Alignment Guides module.
│   │   ├── computeGridSnap.js  # compute Grid Snap module.
│   │   ├── computeSnapDelta.js  # compute Snap Delta module.
│   │   ├── computeSnapTargets.js  # compute Snap Targets module.
│   │   └── snapConstants.js  # snap Constants module.
│   ├── spatial/  # Spatial indexing and world-space helpers.
│   │   ├── __tests__/  # Tests colocated with the owning module.
│   │   │   ├── indexNodeBounds.test.js  # Automated test covering behavior in this area.
│   │   │   ├── spatialIndex.test.js  # Automated test covering behavior in this area.
│   │   │   └── updateSpatialIndex.test.js  # Automated test covering behavior in this area.
│   │   ├── buildSpatialIndex.js  # build Spatial Index module.
│   │   ├── createSpatialIndex.js  # create Spatial Index module.
│   │   ├── getCellKey.js  # get Cell Key module.
│   │   ├── getCellsForBounds.js  # get Cells For Bounds module.
│   │   ├── index.js  # Barrel/export entry for the spatial area.
│   │   ├── indexNodeBounds.js  # index Node Bounds module.
│   │   ├── insertNodeIntoIndex.js  # insert Node Into Index module.
│   │   ├── queryBounds.js  # query Bounds module.
│   │   ├── queryPoint.js  # query Point module.
│   │   ├── removeNodeFromIndex.js  # remove Node From Index module.
│   │   └── updateSpatialIndex.js  # update Spatial Index module.
│   ├── state/  # State models and state utilities.
│   │   ├── previewState.js  # preview State module.
│   │   ├── runtimeState.internal.js  # runtime State internal runtime logic for this feature.
│   │   ├── runtimeState.js  # runtime State runtime logic for this feature.
│   │   └── workspaceRuntime.js  # workspace Runtime runtime logic for this feature.
│   ├── stateMachines/  # State machine runtime and authoring logic.
│   │   ├── __tests__/  # Tests colocated with the owning module.
│   │   │   └── evaluateStateMachine.test.mjs  # Automated test covering behavior in this area.
│   │   ├── evaluation/  # Evaluation pipeline and derived-runtime computation.
│   │   │   ├── evaluateStateMachine.js  # evaluate State Machine module.
│   │   │   └── resolveTransitions.js  # resolve Transitions module.
│   │   ├── index.js  # Barrel/export entry for the stateMachines area.
│   │   ├── stateMachineReducer.js  # state Machine Reducer module.
│   │   ├── stateMachineRegistry.js  # state Machine Registry registry/lookup table for feature definitions.
│   │   ├── stateMachineRuntime.js  # state Machine Runtime runtime logic for this feature.
│   │   └── stateMachineSelectors.js  # state Machine Selectors projection/selector that derives UI-facing data.
│   ├── stores/  # Zustand or other feature stores.
│   │   ├── nodeTreeStore.js  # node Tree Store state store or state container.
│   │   ├── README.md  # Module-level documentation and orientation for this area.
│   │   ├── useAnimatedRuntimeStore.js  # use Animated Runtime Store hook/helper for consuming or deriving feature state.
│   │   ├── useAutoKeyframeStore.js  # use Auto Keyframe Store hook/helper for consuming or deriving feature state.
│   │   ├── useRuntimeStore.js  # use Runtime Store hook/helper for consuming or deriving feature state.
│   │   ├── useSelectionStore.js  # use Selection Store hook/helper for consuming or deriving feature state.
│   │   ├── useTimelinePreviewStore.js  # use Timeline Preview Store hook/helper for consuming or deriving feature state.
│   │   └── useTimelineStore.js  # use Timeline Store hook/helper for consuming or deriving feature state.
│   ├── sync/  # Synchronization and state sync helpers.
│   │   └── README.md  # Module-level documentation and orientation for this area.
│   ├── temporal/  # Time/shot/sequence temporal context helpers.
│   │   ├── __tests__/  # Tests colocated with the owning module.
│   │   │   └── buildTemporalContext.test.mjs  # Automated test covering behavior in this area.
│   │   └── buildTemporalContext.js  # build Temporal Context React context and shared state surface.
│   ├── test/  # Area-specific tests or manual test fixtures.
│   │   ├── cursorReplayTest.js  # cursor Replay Test module.
│   │   ├── designReplayTest.js  # design Replay Test module.
│   │   └── playbackControllerTest.js  # playback Controller Test module.
│   ├── timeline/  # Timeline UI, runtime, or data helpers.
│   │   ├── clearTimelinePreview.js  # clear Timeline Preview timeline-related helper or UI surface.
│   │   ├── commitTimelineKeyframe.js  # commit Timeline Keyframe timeline-related helper or UI surface.
│   │   ├── keyframeTimeUtils.js  # keyframe Time Utils module.
│   │   ├── README.md  # Module-level documentation and orientation for this area.
│   │   ├── scrubTimeline.js  # scrub Timeline timeline-related helper or UI surface.
│   ├── tools/  # Tool definitions, tool availability, and tool helpers.
│   │   ├── __tests__/  # Tests colocated with the owning module.
│   │   │   ├── toolControllerRegistry.test.mjs  # Automated test covering behavior in this area.
│   │   │   └── toolRuntime.test.mjs  # Automated test covering behavior in this area.
│   │   ├── toolController.js  # tool Controller module.
│   │   ├── toolHandlers.js  # tool Handlers module.
│   │   └── toolRuntime.js  # tool Runtime runtime logic for this feature.
│   ├── transforms/  # Transform runtime helpers.
│   │   ├── computeMoveDelta.js  # compute Move Delta module.
│   │   ├── computeResizeAnchors.js  # compute Resize Anchors module.
│   │   ├── computeResizeDelta.js  # compute Resize Delta module.
│   │   ├── computeRotateAnchor.js  # compute Rotate Anchor module.
│   │   ├── computeRotationDelta.js  # compute Rotation Delta module.
│   │   ├── computeTransformAnchor.js  # compute Transform Anchor module.
│   │   └── transformAnchorProjection.js  # transform Anchor Projection projection/selector that derives UI-facing data.
│   ├── transition/  # Transition runtime and transition helpers.
│   │   ├── __tests__/  # Tests colocated with the owning module.
│   │   │   ├── composeSceneTransition.test.mjs  # Automated test covering behavior in this area.
│   │   │   ├── evaluateTransitionFrame.test.mjs  # Automated test covering behavior in this area.
│   │   │   └── resolveSceneTransitionWindow.test.mjs  # Automated test covering behavior in this area.
│   │   ├── composeSceneTransition.js  # compose Scene Transition module.
│   │   ├── evaluateTransitionFrame.js  # evaluate Transition Frame module.
│   │   └── resolveSceneTransitionWindow.js  # resolve Scene Transition Window module.
│   ├── utils/  # Small support utilities.
│   │   ├── hashCanonicalDocument.js  # hash Canonical Document module.
│   │   └── hashRuntimeState.js  # hash Runtime State runtime logic for this feature.
│   ├── validation/  # Validation rules and checks.
│   │   ├── uxRules.js  # ux Rules module.
│   │   └── validateUX.js  # validate UX module.
│   ├── workspaces/  # Workspace-specific runtime, contracts, or helpers.
│   │   ├── __tests__/  # Tests colocated with the owning module.
│   │   │   ├── bootWorkspaceDocument.test.mjs  # Automated test covering behavior in this area.
│   │   │   └── resolveWorkspaceCapabilities.test.mjs  # Automated test covering behavior in this area.
│   │   ├── bootWorkspaceDocument.js  # boot Workspace Document workspace-specific entry, contract, or helper.
│   │   ├── createCapabilityContext.js  # create Capability Context React context and shared state surface.
│   │   ├── defaultDocumentSlices.js  # default Document Slices module.
│   │   ├── index.js  # Barrel/export entry for the workspaces area.
│   │   ├── resolveWorkspaceCapabilities.js  # resolve Workspace Capabilities workspace-specific entry, contract, or helper.
│   │   ├── workspaceCapabilities.js  # workspace Capabilities workspace-specific entry, contract, or helper.
│   │   └── workspaceContracts.js  # workspace Contracts schema/type/contract definition.
│   ├── derivedCacheRegistry.js  # derived Cache Registry registry/lookup table for feature definitions.
│   ├── eventDispatcher.js  # event Dispatcher dispatcher or mutation-funnel implementation.
│   ├── index.js  # Barrel/export entry for the runtime area.
│   ├── MessageBus.js  # Message Bus module.
│   └── README.md  # Module-level documentation and orientation for this area.
├── scratch/  # Scratch files and one-off local experiments.
│   ├── input-session-loader.mjs  # input session loader module.
│   ├── mockMessageBus.mjs  # mock Message Bus module.
│   ├── test-dispatcher.mjs  # test dispatcher dispatcher or mutation-funnel implementation.
│   ├── test-events.mjs  # test events event definition, adapter, or event helper.
│   ├── test-input-session-manager.mjs  # test input session manager module.
│   └── test-input-sessions.mjs  # test input sessions module.
├── scripts/  # Repo automation, gates, and developer scripts.
│   ├── ci/  # ci directory.
│   │   ├── check-ccm-validator-sync.sh  # check ccm validator sync module.
│   │   ├── check-no-pre-dispatch-event-ids.sh  # check no pre dispatch event ids dispatcher or mutation-funnel implementation.
│   │   ├── check-single-message-bus.sh  # check single message bus module.
│   │   ├── check-ux-phase-5-guardrails.sh  # check ux phase 5 guardrails invariant or permission guard.
│   │   └── check-ux-phase-6-guardrails.sh  # check ux phase 6 guardrails invariant or permission guard.
│   ├── git-hooks/  # git hooks directory.
│   │   └── commit-msg  # commit msg module.
│   ├── architectureCi.mjs  # architecture Ci module.
│   ├── architectureDrift.mjs  # architecture Drift module.
│   ├── architectureGuard.mjs  # architecture Guard invariant or permission guard.
│   ├── architectureMonitor.mjs  # architecture Monitor module.
│   ├── architecturePhaseProgress.mjs  # architecture Phase Progress module.
│   ├── architectureRadar.mjs  # architecture Radar module.
│   ├── architectureScore.mjs  # architecture Score module.
│   ├── architectureTransitionAudit.mjs  # architecture Transition Audit module.
│   ├── architectureUtils.mjs  # architecture Utils module.
│   ├── build-ccm-validator.sh  # build ccm validator module.
│   ├── commit.sh  # commit module.
│   ├── createWorkspace.js  # create Workspace workspace-specific entry, contract, or helper.
│   ├── defineScript.js  # define Script module.
│   ├── determinismGate.mjs  # determinism Gate module.
│   ├── dropple-export-gate.mjs  # dropple export gate export helper or export pipeline module.
│   ├── next-with-build-id-fallback.cjs  # next with build id fallback module.
│   ├── registerOfficialTemplates.mjs  # register Official Templates template-related helper, UI, or validator.
│   ├── reorg-file-map.cjs  # reorg file map module.
│   ├── run-everything.sh  # run everything module.
│   ├── runDiscoveredTests.mjs  # run Discovered Tests module.
│   ├── runScript.js  # run Script module.
│   ├── scriptAPI.js  # script API module.
│   ├── scriptGuards.js  # script Guards invariant or permission guard.
│   └── templateVerifyAll.mjs  # template Verify All template-related helper, UI, or validator.
├── security/  # Permission and security helpers.
│   ├── permissions.js  # permissions module.
│   └── usePermissions.js  # use Permissions hook/helper for consuming or deriving feature state.
├── selection/  # Selection-specific helpers and models.
├── share/  # Share-link and embed generation helpers.
│   ├── createEmbedCode.js  # create Embed Code module.
│   ├── createShareLink.js  # create Share Link module.
│   └── embedPresets.js  # embed Presets module.
├── stability/  # Error boundaries and stability wrappers.
│   ├── EditorErrorBoundary.jsx  # Editor Error Boundary module.
│   └── GlobalErrorBoundary.jsx  # Global Error Boundary module.
├── stack/  # Stack auth/server client wrappers.
│   ├── client.js  # client client entry component for a route or feature.
│   └── server.js  # server module.
├── styles/  # Global style tokens and CSS assets.
│   └── tokens.css  # tokens stylesheet.
├── templates/  # Template generation, serialization, and validation.
│   ├── artifacts/  # artifacts directory.
│   │   └── realestate.hero.motion.v1.json  # realestate hero motion v1 data/config artifact.
│   ├── converters/  # converters directory.
│   │   ├── legacyToCCM.ts  # legacy To CCM module.
│   │   └── types.ts  # types schema/type/contract definition.
│   ├── legacy/  # legacy directory.
│   │   └── types.ts  # types schema/type/contract definition.
│   ├── TemplateGeneratorOverlay.jsx  # Template Generator Overlay overlay component rendered above the main surface.
│   ├── TemplateSerializer.js  # Template Serializer template-related helper, UI, or validator.
│   ├── templateTypes.js  # template Types schema/type/contract definition.
│   ├── TemplateValidator.js  # Template Validator template-related helper, UI, or validator.
│   └── useTemplateGenerator.js  # use Template Generator hook/helper for consuming or deriving feature state.
├── tests/  # Cross-cutting automated tests and test loaders.
│   ├── architecture/  # Architecture docs, guards, or generated reports.
│   │   ├── derivedCacheRegistry.test.ts  # Automated test covering behavior in this area.
│   │   ├── dispatcherOwnership.test.ts  # Automated test covering behavior in this area.
│   │   ├── interactionPipelineEnforcement.test.ts  # Automated test covering behavior in this area.
│   │   ├── mergePipelineBoundary.test.ts  # Automated test covering behavior in this area.
│   │   ├── platformSystemClassification.test.ts  # Automated test covering behavior in this area.
│   │   ├── reducerOwnership.test.ts  # Automated test covering behavior in this area.
│   │   ├── truthBoundaryImports.test.ts  # Automated test covering behavior in this area.
│   │   ├── workspaceModeResolution.test.ts  # Automated test covering behavior in this area.
│   │   └── workspaceTaxonomy.test.ts  # Automated test covering behavior in this area.
│   ├── ccm/  # ccm directory.
│   │   └── validateTemplateArtifact.smoke.test.js  # Automated test covering behavior in this area.
│   ├── e2e/  # e2e directory.
│   │   ├── workspace-interactions.spec.js  # Automated test covering behavior in this area.
│   │   ├── workspace-routes.smoke.spec.js  # Automated test covering behavior in this area.
│   │   └── workspace-workflows.smoke.spec.js  # Automated test covering behavior in this area.
│   ├── kernel/  # kernel directory.
│   │   ├── dispatcherContract.test.ts  # Automated test covering behavior in this area.
│   │   ├── motionDocument.test.ts  # Automated test covering behavior in this area.
│   │   ├── persistenceRoundtrip.test.ts  # Automated test covering behavior in this area.
│   │   ├── projectionPurity.test.ts  # Automated test covering behavior in this area.
│   │   ├── projectSceneGraphNormalization.test.ts  # Automated test covering behavior in this area.
│   │   ├── replayDeterminism.test.ts  # Automated test covering behavior in this area.
│   │   ├── rigDispatcherContract.test.ts  # Automated test covering behavior in this area.
│   │   ├── rigDocument.test.ts  # Automated test covering behavior in this area.
│   │   ├── sceneShotAuthoring.test.ts  # Automated test covering behavior in this area.
│   │   ├── sequenceDispatcherContract.test.ts  # Automated test covering behavior in this area.
│   │   ├── sequenceDocument.test.ts  # Automated test covering behavior in this area.
│   │   ├── stateMachineDispatcherContract.test.ts  # Automated test covering behavior in this area.
│   │   ├── stateMachineDocument.test.ts  # Automated test covering behavior in this area.
│   │   ├── stateShape.test.ts  # Automated test covering behavior in this area.
│   │   └── truthReplayEquivalence.test.ts  # Automated test covering behavior in this area.
│   ├── loaders/  # Test/runtime loaders and module loaders.
│   │   └── ts-test-loader.mjs  # test loader module.
│   ├── system/  # System-level tests or system-specific modules.
│   │   ├── runtimeSmoke.test.mjs  # Automated test covering behavior in this area.
│   │   └── systemConsistency.test.mjs  # Automated test covering behavior in this area.
│   ├── appRuntime.test.js  # Automated test covering behavior in this area.
│   ├── clipboard.test.js  # Automated test covering behavior in this area.
│   ├── components.test.js  # Automated test covering behavior in this area.
│   ├── constraints.test.js  # Automated test covering behavior in this area.
│   ├── dataRuntime.test.js  # Automated test covering behavior in this area.
│   ├── grouping.test.js  # Automated test covering behavior in this area.
│   ├── guides.test.js  # Automated test covering behavior in this area.
│   ├── interactionEngine.test.js  # Automated test covering behavior in this area.
│   ├── interactionSessions.test.js  # Automated test covering behavior in this area.
│   ├── README.md  # Module-level documentation and orientation for this area.
│   ├── register-test-loaders.mjs  # register test loaders module.
│   ├── selection.test.js  # Automated test covering behavior in this area.
│   ├── selectionBounds.test.js  # Automated test covering behavior in this area.
│   ├── snapEngine.test.js  # Automated test covering behavior in this area.
│   ├── transformAnchor.test.js  # Automated test covering behavior in this area.
│   └── transformSessions.test.js  # Automated test covering behavior in this area.
├── timeline/  # Timeline math, schemas, playback, and evaluation utilities.
│   ├── __tests__/  # Tests colocated with the owning module.
│   │   └── evaluateAnimationTimeline.test.js  # Automated test covering behavior in this area.
│   ├── easing/  # easing directory.
│   │   └── easingPresets.js  # easing Presets module.
│   ├── export/  # Export logic and export-related UI/runtime code.
│   │   ├── cssExporter.js  # css Exporter export helper or export pipeline module.
│   │   ├── groupMotionFrames.js  # group Motion Frames module.
│   │   └── motionIR.js  # motion IR module.
│   ├── keyboard/  # Keyboard handling and keyboard intent helpers.
│   │   └── useTimelineKeyboard.js  # use Timeline Keyboard hook/helper for consuming or deriving feature state.
│   ├── markers/  # markers directory.
│   │   ├── MarkerControls.jsx  # Marker Controls module.
│   │   └── useTimelineMarkers.js  # use Timeline Markers hook/helper for consuming or deriving feature state.
│   ├── normalize/  # normalize directory.
│   │   └── normalizeKeyframes.js  # normalize Keyframes module.
│   ├── playback/  # Playback helpers and timeline playback logic.
│   │   ├── PlaybackControls.jsx  # Playback Controls module.
│   │   ├── usePlaybackPreviewBridge.js  # use Playback Preview Bridge hook/helper for consuming or deriving feature state.
│   │   └── useTimelinePlayback.js  # use Timeline Playback hook/helper for consuming or deriving feature state.
│   ├── schema/  # Schemas and canonical data shapes.
│   │   ├── clip.js  # clip module.
│   │   ├── keyframe.js  # keyframe module.
│   │   ├── timeline.js  # timeline timeline-related helper or UI surface.
│   │   └── track.js  # track module.
│   ├── transform/  # Transform helpers and coordinate conversion.
│   │   └── composeTransform.js  # compose Transform module.
│   ├── utils/  # Small support utilities.
│   │   └── findActiveClips.js  # find Active Clips module.
│   ├── animationContract.js  # animation Contract schema/type/contract definition.
│   ├── computeReplaySlice.js  # compute Replay Slice module.
│   ├── easingMath.js  # easing Math module.
│   ├── easingRegistry.js  # easing Registry registry/lookup table for feature definitions.
│   ├── evaluateAnimationAtTime.js  # evaluate Animation At Time animation helper or animation UI/runtime module.
│   ├── evaluateAnimationProjection.js  # evaluate Animation Projection projection/selector that derives UI-facing data.
│   ├── evaluateAnimationTimeline.js  # evaluate Animation Timeline timeline-related helper or UI surface.
│   ├── evaluateAnimationTrack.js  # evaluate Animation Track animation helper or animation UI/runtime module.
│   ├── evaluateTimeline.js  # evaluate Timeline timeline-related helper or UI surface.
│   ├── evaluateTimelineFrame.js  # evaluate Timeline Frame timeline-related helper or UI surface.
│   ├── keyframeSchema.js  # keyframe Schema schema/type/contract definition.
│   ├── motionPresets.js  # motion Presets module.
│   ├── resolveEasing.js  # resolve Easing module.
│   ├── sampleKeyframes.js  # sample Keyframes module.
│   ├── sampleTimeline.js  # sample Timeline timeline-related helper or UI surface.
│   ├── timelineCursor.js  # timeline Cursor timeline-related helper or UI surface.
│   ├── timelineSchema.js  # timeline Schema schema/type/contract definition.
│   └── trackSchema.js  # track Schema schema/type/contract definition.
├── tools/  # Tooling helpers, including ESLint/toolchain support.
│   └── eslint/  # eslint directory.
│       └── dropple-architecture.js  # dropple architecture module.
├── translate/  # Design/code translation and pseudo-code generation.
│   ├── designToPseudoCode.js  # design To Pseudo Code module.
│   └── pseudoCodeToReact.js  # pseudo Code To React module.
├── ui/  # React UI, buses, bridges, panels, and interaction surfaces.
│   ├── alignment/  # alignment directory.
│   ├── animation/  # Animation-specific runtime or engine modules.
│   │   ├── curves/  # curves directory.
│   │   │   ├── BezierCurveCanvas.jsx  # Bezier Curve Canvas canvas-related component or helper.
│   │   │   ├── commitCurveChange.js  # commit Curve Change module.
│   │   │   ├── CurveCanvas.jsx  # Curve Canvas canvas-related component or helper.
│   │   │   ├── CurveEditorPanel.jsx  # Curve Editor Panel panel component for a feature workspace.
│   │   │   ├── CurveHandle.jsx  # Curve Handle module.
│   │   │   └── CurvePresetPicker.jsx  # Curve Preset Picker module.
│   │   ├── applyWebAnimations.js  # apply Web Animations animation helper or animation UI/runtime module.
│   │   ├── evaluateGhostFrames.js  # evaluate Ghost Frames module.
│   │   ├── evaluateMotionTrails.js  # evaluate Motion Trails module.
│   │   ├── getConstraintVisuals.js  # get Constraint Visuals module.
│   │   ├── useConstraintVisualizerStore.js  # use Constraint Visualizer Store hook/helper for consuming or deriving feature state.
│   │   ├── useMotionTrailStore.js  # use Motion Trail Store hook/helper for consuming or deriving feature state.
│   │   └── useOnionSkinStore.js  # use Onion Skin Store hook/helper for consuming or deriving feature state.
│   ├── availability/  # availability directory.
│   │   ├── availability.js  # availability module.
│   │   ├── resolveAvailability.js  # resolve Availability module.
│   │   └── useAvailability.js  # use Availability hook/helper for consuming or deriving feature state.
│   ├── bridges/  # Translation layers between buses, UI, and runtime.
│   │   ├── __tests__/  # Tests colocated with the owning module.
│   │   │   ├── capabilityToolBridge.test.mjs  # Automated test covering behavior in this area.
│   │   │   ├── dispatcherRebindingBridges.test.mjs  # Automated test covering behavior in this area.
│   │   │   ├── sessionIsolation.test.mjs  # Automated test covering behavior in this area.
│   │   │   ├── shotEditorBridge.test.mjs  # Automated test covering behavior in this area.
│   │   │   ├── toolHandlerRegistrationFacade.test.mjs  # Automated test covering behavior in this area.
│   │   │   └── toolIntentBridge.test.mjs  # Automated test covering behavior in this area.
│   │   ├── alignmentBridge.js  # alignment Bridge translation bridge between layers or buses.
│   │   ├── animationKeyframeBridge.js  # animation Keyframe Bridge translation bridge between layers or buses.
│   │   ├── canvasRuntimeFacade.js  # canvas Runtime Facade runtime logic for this feature.
│   │   ├── canvasSurfaceBridge.js  # canvas Surface Bridge translation bridge between layers or buses.
│   │   ├── capabilityToolBridge.js  # capability Tool Bridge translation bridge between layers or buses.
│   │   ├── commandIntentBridge.js  # command Intent Bridge translation bridge between layers or buses.
│   │   ├── editEventBridge.js  # edit Event Bridge translation bridge between layers or buses.
│   │   ├── exportAnimationBridge.js  # export Animation Bridge translation bridge between layers or buses.
│   │   ├── exportMotionBridge.js  # export Motion Bridge translation bridge between layers or buses.
│   │   ├── graphIntentBridge.js  # graph Intent Bridge translation bridge between layers or buses.
│   │   ├── groupSessionBridge.js  # group Session Bridge translation bridge between layers or buses.
│   │   ├── historyBridge.js  # history Bridge translation bridge between layers or buses.
│   │   ├── inputEngineFacade.js  # input Engine Facade module.
│   │   ├── inputIntentBridge.js  # input Intent Bridge translation bridge between layers or buses.
│   │   ├── inputSessionRuntimeFacade.js  # input Session Runtime Facade runtime logic for this feature.
│   │   ├── intentEventFacade.js  # intent Event Facade event definition, adapter, or event helper.
│   │   ├── interactionSessionBridge.js  # interaction Session Bridge translation bridge between layers or buses.
│   │   ├── keyboardEngineFacade.js  # keyboard Engine Facade module.
│   │   ├── layoutConvertBridge.js  # layout Convert Bridge translation bridge between layers or buses.
│   │   ├── nodeCreateBridge.js  # node Create Bridge translation bridge between layers or buses.
│   │   ├── nodeDragBridge.js  # node Drag Bridge translation bridge between layers or buses.
│   │   ├── nodeUpdateBridge.js  # node Update Bridge translation bridge between layers or buses.
│   │   ├── PersistenceBridge.jsx  # Persistence Bridge translation bridge between layers or buses.
│   │   ├── persistenceRuntimeFacade.js  # persistence Runtime Facade runtime logic for this feature.
│   │   ├── runtimeCommandFacade.js  # runtime Command Facade runtime logic for this feature.
│   │   ├── selectionIntentBridge.js  # selection Intent Bridge translation bridge between layers or buses.
│   │   ├── selectionRuntimeFacade.js  # selection Runtime Facade runtime logic for this feature.
│   │   ├── sessionBridge.js  # session Bridge translation bridge between layers or buses.
│   │   ├── sessionCommitBridge.js  # session Commit Bridge translation bridge between layers or buses.
│   │   ├── sessionCommitRuntimeFacade.js  # session Commit Runtime Facade runtime logic for this feature.
│   │   ├── shotEditorBridge.js  # shot Editor Bridge translation bridge between layers or buses.
│   │   ├── timelineBridge.js  # timeline Bridge translation bridge between layers or buses.
│   │   ├── timelinePanelBridge.js  # timeline Panel Bridge translation bridge between layers or buses.
│   │   ├── timelinePreviewRuntimeBridge.js  # timeline Preview Runtime Bridge translation bridge between layers or buses.
│   │   ├── toolHandlerRegistrationFacade.js  # tool Handler Registration Facade module.
│   │   ├── toolIntentBridge.js  # tool Intent Bridge translation bridge between layers or buses.
│   │   ├── uxConfirmRuntimeFacade.js  # ux Confirm Runtime Facade runtime logic for this feature.
│   │   ├── viewportBridge.js  # viewport Bridge translation bridge between layers or buses.
│   │   ├── workspaceActivationFacade.js  # workspace Activation Facade workspace-specific entry, contract, or helper.
│   │   ├── workspaceBridge.js  # workspace Bridge translation bridge between layers or buses.
│   │   └── worldPersistenceRuntimeFacade.js  # world Persistence Runtime Facade runtime logic for this feature.
│   ├── canvas/  # Canvas rendering and canvas-surface code.
│   │   ├── canvas/  # Canvas rendering and canvas-surface code.
│   │   │   ├── overlays/  # overlays directory.
│   │   │   ├── AutoLayoutOverlayLayer.jsx  # Auto Layout Overlay Layer overlay component rendered above the main surface.
│   │   │   ├── computeSnapGuides.js  # compute Snap Guides module.
│   │   │   ├── resolveGridSnap.js  # resolve Grid Snap module.
│   │   │   ├── resolveSnap.js  # resolve Snap module.
│   │   │   ├── snapConfig.js  # snap Config module.
│   │   │   ├── SnapGuidesOverlay.jsx  # Snap Guides Overlay overlay component rendered above the main surface.
│   │   │   └── useAutoLayoutOverlayVisibility.js  # use Auto Layout Overlay Visibility hook/helper for consuming or deriving feature state.
│   │   ├── hooks/  # React hooks or runtime hook wrappers.
│   │   │   ├── useCharacterRenderNodes.js  # use Character Render Nodes hook/helper for consuming or deriving feature state.
│   │   │   └── useNearestWorldObjects.js  # use Nearest World Objects hook/helper for consuming or deriving feature state.
│   │   ├── intelligence/  # intelligence directory.
│   │   │   ├── __tests__/  # Tests colocated with the owning module.
│   │   │   ├── observeSpatialState.js  # observe Spatial State module.
│   │   │   ├── suggestionLayer.js  # suggestion Layer module.
│   │   │   └── validationSuggestionBridge.js  # validation Suggestion Bridge translation bridge between layers or buses.
│   │   ├── nearest/  # nearest directory.
│   │   │   ├── nearestWorldNodes.js  # nearest World Nodes module.
│   │   │   └── nearRadius.js  # near Radius module.
│   │   ├── snap/  # snap directory.
│   │   │   └── snapToGrid.js  # snap To Grid module.
│   │   ├── suggestions/  # suggestions directory.
│   │   │   ├── suggestionStore.js  # suggestion Store state store or state container.
│   │   │   └── useSuggestions.js  # use Suggestions hook/helper for consuming or deriving feature state.
│   │   ├── surface/  # surface directory.
│   │   │   ├── CanvasSurface.jsx  # Canvas Surface canvas-related component or helper.
│   │   │   └── CanvasSurfaceSwitcher.jsx  # Canvas Surface Switcher canvas-related component or helper.
│   │   ├── validation/  # Validation rules and checks.
│   │   │   ├── __tests__/  # Tests colocated with the owning module.
│   │   │   ├── useValidationIssues.js  # use Validation Issues hook/helper for consuming or deriving feature state.
│   │   │   └── validationStore.js  # validation Store state store or state container.
│   │   ├── CanvasContext.jsx  # Canvas Context React context and shared state surface.
│   │   ├── CanvasDebugOverlay.jsx  # Canvas Debug Overlay overlay component rendered above the main surface.
│   │   ├── CanvasGhostLayer.jsx  # Canvas Ghost Layer canvas-related component or helper.
│   │   ├── CanvasHost.jsx  # Canvas Host canvas-related component or helper.
│   │   ├── CanvasNearestDebugOverlay.jsx  # Canvas Nearest Debug Overlay overlay component rendered above the main surface.
│   │   ├── CanvasOriginMarker.jsx  # Canvas Origin Marker canvas-related component or helper.
│   │   ├── CanvasRoot.jsx  # Canvas Root canvas-related component or helper.
│   │   ├── CanvasSnapGuides.jsx  # Canvas Snap Guides canvas-related component or helper.
│   │   ├── CollabLayer.jsx  # Collab Layer module.
│   │   ├── computeCenteredViewport.js  # compute Centered Viewport module.
│   │   ├── ConstraintVisualizerLayer.jsx  # Constraint Visualizer Layer module.
│   │   ├── FrameRulers.jsx  # Frame Rulers module.
│   │   ├── GhostFrameLayer.jsx  # Ghost Frame Layer module.
│   │   ├── GhostLayer.jsx  # Ghost Layer module.
│   │   ├── GhostNode.jsx  # Ghost Node module.
│   │   ├── GroupTransformOverlay.jsx  # Group Transform Overlay overlay component rendered above the main surface.
│   │   ├── GuideLayer.jsx  # Guide Layer module.
│   │   ├── InsertionLine.jsx  # Insertion Line module.
│   │   ├── Minimap.jsx  # Minimap module.
│   │   ├── MotionTrailLayer.jsx  # Motion Trail Layer module.
│   │   ├── NodeLayer.jsx  # Node Layer module.
│   │   ├── NodeRenderer.jsx  # Node Renderer module.
│   │   ├── RemoteCursors.jsx  # Remote Cursors module.
│   │   ├── RemoteSelections.jsx  # Remote Selections module.
│   │   ├── runCanvasLoop.js  # run Canvas Loop canvas-related component or helper.
│   │   ├── SelectionLayer.jsx  # Selection Layer module.
│   │   ├── SelectionOutline.jsx  # Selection Outline module.
│   │   ├── SuggestionCard.jsx  # Suggestion Card module.
│   │   ├── SuggestionPanel.jsx  # Suggestion Panel panel component for a feature workspace.
│   │   ├── useWorldPersistence.js  # use World Persistence hook/helper for consuming or deriving feature state.
│   │   ├── ValidationOverlayLayer.jsx  # Validation Overlay Layer overlay component rendered above the main surface.
│   │   ├── ValidationPanel.jsx  # Validation Panel panel component for a feature workspace.
│   │   └── WorldOriginMarker.jsx  # World Origin Marker module.
│   ├── capabilities/  # Capability registries, activation, and runtime wiring.
│   │   ├── capabilityActions.js  # capability Actions module.
│   │   ├── capabilityVocabulary.js  # capability Vocabulary module.
│   │   ├── modeLocks.js  # mode Locks module.
│   │   ├── toolCapabilities.js  # tool Capabilities module.
│   │   └── workspaceCapabilities.js  # workspace Capabilities workspace-specific entry, contract, or helper.
│   ├── context/  # React context state and providers.
│   │   ├── ContextMenu.jsx  # Context Menu React context and shared state surface.
│   │   └── useContextMenu.js  # use Context Menu React context and shared state surface.
│   ├── controls/  # Control widgets and shared UI controls.
│   │   ├── ui/  # UI composition for the surrounding feature.
│   │   │   ├── badge.jsx  # badge module.
│   │   │   ├── button.jsx  # button button/action component.
│   │   │   ├── card.jsx  # card module.
│   │   │   └── textarea.jsx  # textarea module.
│   │   └── AspectLockToggle.jsx  # Aspect Lock Toggle module.
│   ├── creation/  # Creation flows, creation intents, and node creation UI.
│   │   └── nodeCreateIntent.js  # node Create Intent intent emitter or intent translation helper.
│   ├── eventBus/  # Event bus implementations and adapters.
│   │   └── canvasBus.js  # canvas Bus canvas-related component or helper.
│   ├── export/  # Export logic and export-related UI/runtime code.
│   │   ├── exportGateClient.js  # export Gate Client client entry component for a route or feature.
│   │   ├── ExportGateOverlay.jsx  # Export Gate Overlay overlay component rendered above the main surface.
│   │   ├── exportGateStore.js  # export Gate Store state store or state container.
│   │   ├── exportMotion.js  # export Motion export helper or export pipeline module.
│   │   ├── ExportWarningSheet.jsx  # Export Warning Sheet export helper or export pipeline module.
│   │   ├── Sheet.jsx  # Sheet module.
│   │   ├── SheetFooter.jsx  # Sheet Footer module.
│   │   ├── SheetHeader.jsx  # Sheet Header module.
│   │   ├── SheetIssues.jsx  # Sheet Issues module.
│   │   ├── SheetSummary.jsx  # Sheet Summary module.
│   │   └── ValidationIssueRow.jsx  # Validation Issue Row module.
│   ├── files/  # File handling UI and import/export helpers.
│   │   └── FilePicker.jsx  # File Picker module.
│   ├── history/  # Undo/redo and history helpers.
│   │   └── historyIntent.js  # history Intent intent emitter or intent translation helper.
│   ├── inputs/  # inputs directory.
│   │   └── NumericInput.jsx  # Numeric Input module.
│   ├── inspector/  # Inspector sections and inspector UI logic.
│   │   ├── AutoLayoutPanel.jsx  # Auto Layout Panel panel component for a feature workspace.
│   │   ├── ContentPanel.jsx  # Content Panel panel component for a feature workspace.
│   │   ├── ExportPreviewPanel.jsx  # Export Preview Panel panel component for a feature workspace.
│   │   ├── InspectorSection.jsx  # Inspector Section module.
│   │   ├── LayoutInspector.jsx  # Layout Inspector layout helper or layout pipeline module.
│   │   ├── MotionPanel.jsx  # Motion Panel panel component for a feature workspace.
│   │   ├── NodeHeaderPanel.jsx  # Node Header Panel panel component for a feature workspace.
│   │   ├── nodeUpdateIntent.js  # node Update Intent intent emitter or intent translation helper.
│   │   └── SemanticsPanel.jsx  # Semantics Panel panel component for a feature workspace.
│   ├── interaction/  # Interaction runtime, drag sessions, and pointer logic.
│   │   ├── bridges/  # Translation layers between buses, UI, and runtime.
│   │   │   └── UXWarningBridge.js  # UXWarning Bridge translation bridge between layers or buses.
│   │   ├── interaction/  # Interaction runtime, drag sessions, and pointer logic.
│   │   │   ├── isModifierAllowed.js  # is Modifier Allowed module.
│   │   │   ├── useInteractionModifiers.js  # use Interaction Modifiers hook/helper for consuming or deriving feature state.
│   │   │   └── useKeyboardShortcuts.js  # use Keyboard Shortcuts hook/helper for consuming or deriving feature state.
│   │   ├── sessionBinding.js  # session Binding module.
│   │   └── toolRegistration.js  # tool Registration module.
│   ├── interactions/  # Interaction models, pure interaction logic, or UI integration.
│   │   ├── __tests__/  # Tests colocated with the owning module.
│   │   │   └── toolController.test.mjs  # Automated test covering behavior in this area.
│   │   ├── hitTestNode.js  # hit Test Node module.
│   │   ├── interactionSession.js  # interaction Session module.
│   │   ├── resolveTargetNodeId.js  # resolve Target Node Id module.
│   │   ├── sessionGrouping.js  # session Grouping module.
│   │   ├── toolController.js  # tool Controller module.
│   │   └── useCanvasInteractions.js  # use Canvas Interactions hook/helper for consuming or deriving feature state.
│   ├── keyboard/  # Keyboard handling and keyboard intent helpers.
│   │   ├── useAlignmentShortcuts.js  # use Alignment Shortcuts hook/helper for consuming or deriving feature state.
│   │   ├── useGroupShortcuts.js  # use Group Shortcuts hook/helper for consuming or deriving feature state.
│   │   └── useKeyboardNudge.js  # use Keyboard Nudge hook/helper for consuming or deriving feature state.
│   ├── layout/  # Layout pipelines, layout pass logic, and layout helpers.
│   │   ├── CanvasStage.jsx  # Canvas Stage canvas-related component or helper.
│   │   ├── computeFlexLayout.js  # compute Flex Layout layout helper or layout pipeline module.
│   │   ├── computeGridLayout.js  # compute Grid Layout layout helper or layout pipeline module.
│   │   ├── computeReorderIndex.js  # compute Reorder Index module.
│   │   ├── layoutConvertIntent.js  # layout Convert Intent intent emitter or intent translation helper.
│   │   ├── LeftPanel.jsx  # Left Panel panel component for a feature workspace.
│   │   ├── PropertyBar.jsx  # Property Bar module.
│   │   ├── ReadOnlyNodeRenderer.jsx  # Read Only Node Renderer module.
│   │   ├── ReadOnlyScene.jsx  # Read Only Scene module.
│   │   ├── RightPanel.jsx  # Right Panel panel component for a feature workspace.
│   │   ├── TimelineBar.jsx  # Timeline Bar timeline-related helper or UI surface.
│   │   ├── Toolbar.jsx  # Toolbar toolbar component for feature controls.
│   │   └── TopBar.jsx  # Top Bar module.
│   ├── panels/  # Panel components grouped by feature.
│   │   ├── AutoLayoutPanel.js  # Auto Layout Panel panel component for a feature workspace.
│   │   ├── ExportPanel.jsx  # Export Panel panel component for a feature workspace.
│   │   ├── InspectorPanel.jsx  # Inspector Panel panel component for a feature workspace.
│   │   └── PanelRegistry.js  # Panel Registry registry/lookup table for feature definitions.
│   ├── registry/  # Registry/lookup modules.
│   │   ├── CertifiedTemplatePanel.jsx  # Certified Template Panel panel component for a feature workspace.
│   │   └── useCertifiedTemplates.js  # use Certified Templates hook/helper for consuming or deriving feature state.
│   ├── reviews/  # Review routes and review views.
│   │   ├── ConfirmDecision.jsx  # Confirm Decision module.
│   │   ├── IssueCertificateButton.jsx  # Issue Certificate Button button/action component.
│   │   └── ReviewQueue.jsx  # Review Queue module.
│   ├── rigging/  # Rigging runtime and rigging authoring logic.
│   │   ├── RigControllerOverlay.jsx  # Rig Controller Overlay overlay component rendered above the main surface.
│   │   └── RigInspectorPanel.jsx  # Rig Inspector Panel panel component for a feature workspace.
│   ├── selection/  # Selection state, selection logic, and selection UI.
│   │   └── SelectionBox.jsx  # Selection Box module.
│   ├── share/  # Sharing UI and sharing helpers.
│   │   └── EmbedPresetsMenu.jsx  # Embed Presets Menu module.
│   ├── shared/  # shared directory.
│   │   └── guards/  # Guards enforcing invariants before mutation or evaluation.
│   │       ├── RequireReviewer.jsx  # Require Reviewer viewer-only UI or viewer helper.
│   │       └── ReviewerErrorBoundary.jsx  # Reviewer Error Boundary viewer-only UI or viewer helper.
│   ├── state/  # State models and state utilities.
│   │   └── useToolStore.js  # use Tool Store hook/helper for consuming or deriving feature state.
│   ├── styles/  # CSS and style support files.
│   │   └── uiux.css  # uiux stylesheet.
│   ├── timeline/  # Timeline UI, runtime, or data helpers.
│   │   ├── components/  # Reusable components or runtime component evaluation.
│   │   │   └── TransitionHandle.jsx  # Transition Handle module.
│   │   ├── applyTimelinePreview.js  # apply Timeline Preview timeline-related helper or UI surface.
│   │   ├── EditableKeyframe.jsx  # Editable Keyframe module.
│   │   ├── KeyframeDots.jsx  # Keyframe Dots module.
│   │   ├── samplePreviewState.js  # sample Preview State module.
│   │   ├── ShotHUD.jsx  # Shot HUD module.
│   │   ├── ShotTimelineBar.jsx  # Shot Timeline Bar timeline-related helper or UI surface.
│   │   ├── TimelineEventLog.jsx  # Timeline Event Log event definition, adapter, or event helper.
│   │   ├── timelineIntent.js  # timeline Intent intent emitter or intent translation helper.
│   │   ├── TimelinePanel.jsx  # Timeline Panel panel component for a feature workspace.
│   │   ├── TimelinePlayhead.jsx  # Timeline Playhead timeline-related helper or UI surface.
│   │   ├── TimelineScrubber.jsx  # Timeline Scrubber timeline-related helper or UI surface.
│   │   ├── TimelineTimeScale.jsx  # Timeline Time Scale timeline-related helper or UI surface.
│   │   ├── TimelineTrack.jsx  # Timeline Track timeline-related helper or UI surface.
│   │   ├── TimelineTrackList.jsx  # Timeline Track List timeline-related helper or UI surface.
│   │   ├── TimelineTracks.jsx  # Timeline Tracks timeline-related helper or UI surface.
│   │   ├── useCommitKeyframeDrag.js  # use Commit Keyframe Drag hook/helper for consuming or deriving feature state.
│   │   ├── useKeyframeDragPreview.js  # use Keyframe Drag Preview hook/helper for consuming or deriving feature state.
│   │   ├── useKeyframePointer.js  # use Keyframe Pointer hook/helper for consuming or deriving feature state.
│   │   ├── useTimelineBounds.js  # use Timeline Bounds hook/helper for consuming or deriving feature state.
│   │   ├── useTimelinePreviewBridge.js  # use Timeline Preview Bridge hook/helper for consuming or deriving feature state.
│   │   ├── useTimelinePreviewStore.js  # use Timeline Preview Store hook/helper for consuming or deriving feature state.
│   │   ├── useTimelineSelectionStore.js  # use Timeline Selection Store hook/helper for consuming or deriving feature state.
│   │   └── useTimelineSnapping.js  # use Timeline Snapping hook/helper for consuming or deriving feature state.
│   ├── tools/  # Tool definitions, tool availability, and tool helpers.
│   │   ├── createFrameTool.js  # create Frame Tool module.
│   │   ├── createLayerTool.js  # create Layer Tool module.
│   │   ├── createShapeTool.js  # create Shape Tool module.
│   │   ├── defaultCreateTool.js  # default Create Tool module.
│   │   └── toolDefinitions.js  # tool Definitions module.
│   ├── viewport/  # Viewport state and viewport helpers.
│   │   └── viewportIntent.js  # viewport Intent intent emitter or intent translation helper.
│   ├── workspace/  # workspace directory.
│   │   ├── __tests__/  # Tests colocated with the owning module.
│   │   │   ├── reconcileCapabilityLifecycle.test.mjs  # Automated test covering behavior in this area.
│   │   │   └── resolveWorkspaceCapabilityComponents.test.mjs  # Automated test covering behavior in this area.
│   │   ├── capabilities/  # Capability registries, activation, and runtime wiring.
│   │   │   ├── capabilityRegistry.js  # capability Registry registry/lookup table for feature definitions.
│   │   │   ├── reconcileCapabilityLifecycle.js  # reconcile Capability Lifecycle module.
│   │   │   └── resolveCapabilityComponents.js  # resolve Capability Components module.
│   │   ├── editor/  # editor directory.
│   │   │   ├── __tests__/  # Tests colocated with the owning module.
│   │   │   ├── EditorWorkspaceLayout.jsx  # Editor Workspace Layout layout helper or layout pipeline module.
│   │   │   ├── EditorWorkspaceShell.jsx  # Editor Workspace Shell feature shell/layout component.
│   │   │   └── shotEditorIntent.js  # shot Editor Intent intent emitter or intent translation helper.
│   │   ├── media/  # Media workspace and media-specific views or runtime.
│   │   │   ├── animation/  # Animation-specific runtime or engine modules.
│   │   │   ├── inspector/  # Inspector sections and inspector UI logic.
│   │   │   ├── shared/  # shared directory.
│   │   │   ├── mediaModes.js  # media Modes module.
│   │   │   ├── MediaModeSwitcher.jsx  # Media Mode Switcher module.
│   │   │   └── MediaWorkspaceShell.jsx  # Media Workspace Shell feature shell/layout component.
│   │   ├── root/  # root directory.
│   │   │   ├── DispatcherProvider/  # Dispatcher Provider directory.
│   │   │   ├── createEventDispatcher.js  # create Event Dispatcher dispatcher or mutation-funnel implementation.
│   │   │   └── WorkspaceRoot.jsx  # Workspace Root workspace-specific entry, contract, or helper.
│   │   ├── shared/  # shared directory.
│   │   │   ├── ClipboardContext.jsx  # Clipboard Context React context and shared state surface.
│   │   │   ├── GridContext.jsx  # Grid Context React context and shared state surface.
│   │   │   ├── ModeContext.jsx  # Mode Context React context and shared state surface.
│   │   │   ├── ModeSwitcher.jsx  # Mode Switcher module.
│   │   │   ├── pasteFromClipboard.js  # paste From Clipboard module.
│   │   │   ├── SelectionContext.jsx  # Selection Context React context and shared state surface.
│   │   │   ├── serializeSelection.js  # serialize Selection module.
│   │   │   ├── useAutoLayoutCommit.js  # use Auto Layout Commit hook/helper for consuming or deriving feature state.
│   │   │   ├── useWorkspaceNavigation.js  # use Workspace Navigation hook/helper for consuming or deriving feature state.
│   │   │   ├── WorkspaceLayout.jsx  # Workspace Layout layout helper or layout pipeline module.
│   │   │   ├── WorkspaceShell.jsx  # Workspace Shell feature shell/layout component.
│   │   │   └── WorkspaceSwitcher.jsx  # Workspace Switcher workspace-specific entry, contract, or helper.
│   │   ├── shell/  # shell directory.
│   │   │   ├── ModeLoader.jsx  # Mode Loader module.
│   │   │   ├── PanelRenderer.jsx  # Panel Renderer panel component for a feature workspace.
│   │   │   └── WorkspaceShell.jsx  # Workspace Shell feature shell/layout component.
│   │   ├── ux/  # ux directory.
│   │   │   ├── canvas/  # Canvas rendering and canvas-surface code.
│   │   │   ├── panels/  # Panel components grouped by feature.
│   │   │   ├── UIUXAuthoringShell.jsx  # UIUXAuthoring Shell feature shell/layout component.
│   │   │   ├── UIUXCanvasStage.jsx  # UIUXCanvas Stage canvas-related component or helper.
│   │   │   ├── UIUXToolRail.jsx  # UIUXTool Rail module.
│   │   │   ├── UIUXTopBar.jsx  # UIUXTop Bar module.
│   │   │   ├── useUXViewport.js  # use UXViewport hook/helper for consuming or deriving feature state.
│   │   │   ├── uxCanvasPolicy.js  # ux Canvas Policy canvas-related component or helper.
│   │   │   ├── UXInspectorPanel.jsx  # UXInspector Panel panel component for a feature workspace.
│   │   │   └── UXWorkspaceShell.jsx  # UXWorkspace Shell feature shell/layout component.
│   │   ├── canvasSurfaceIntent.js  # canvas Surface Intent intent emitter or intent translation helper.
│   │   ├── DispatcherContext.jsx  # Dispatcher Context React context and shared state surface.
│   │   ├── useCapabilityLifecycle.js  # use Capability Lifecycle hook/helper for consuming or deriving feature state.
│   │   ├── useHydrateDocument.js  # use Hydrate Document hook/helper for consuming or deriving feature state.
│   │   ├── useWorkspaceCapabilities.js  # use Workspace Capabilities hook/helper for consuming or deriving feature state.
│   │   ├── WorkspaceCanvasRoot.jsx  # Workspace Canvas Root canvas-related component or helper.
│   │   └── workspaceIntent.js  # workspace Intent intent emitter or intent translation helper.
│   ├── Canvas.jsx  # Canvas canvas-related component or helper.
│   ├── Control.jsx  # Control module.
│   ├── Controls.jsx  # Controls module.
│   ├── index.js  # Barrel/export entry for the ui area.
│   ├── NodeView.jsx  # Node View module.
│   ├── Panel.jsx  # Panel panel component for a feature workspace.
│   ├── README.md  # Module-level documentation and orientation for this area.
│   └── tokens.js  # tokens module.
├── utils/  # Small shared utilities.
│   └── safeMutation.js  # safe Mutation module.
├── validation/  # Validation helpers and invariant checks.
│   └── canProjectToCanonicalNode.js  # can Project To Canonical Node module.
├── viewer/  # Viewer-only stage and toolbar code.
│   ├── parseViewerParams.js  # parse Viewer Params viewer-only UI or viewer helper.
│   ├── useViewerControls.js  # use Viewer Controls hook/helper for consuming or deriving feature state.
│   ├── ViewerStage.jsx  # Viewer Stage viewer-only UI or viewer helper.
│   └── ViewerToolbar.jsx  # Viewer Toolbar toolbar component for feature controls.
├── workspace/  # Legacy workspace shell/bootstrap modules.
│   ├── test/  # Area-specific tests or manual test fixtures.
│   │   └── workspaceShellTest.html  # workspace Shell Test HTML fixture or manual test surface.
│   ├── timeline/  # Timeline UI, runtime, or data helpers.
│   │   └── TimelineUI.js  # Timeline UI timeline-related helper or UI surface.
│   ├── createFromTemplate.js  # create From Template template-related helper, UI, or validator.
│   ├── index.js  # Barrel/export entry for the workspace area.
│   └── WorkspaceShell.js  # Workspace Shell feature shell/layout component.
├── workspaces/  # Legacy/transition workspace registries and modes.
│   ├── modes/  # Workspace mode definitions.
│   ├── registry/  # Registry/lookup modules.
│   │   ├── aiWorkspace.js  # ai Workspace workspace-specific entry, contract, or helper.
│   │   ├── animationWorkspace.js  # animation Workspace animation helper or animation UI/runtime module.
│   │   ├── brandingWorkspace.js  # branding Workspace workspace-specific entry, contract, or helper.
│   │   ├── canvasSurfacePolicy.js  # canvas Surface Policy canvas-related component or helper.
│   │   ├── conversionWorkspace.js  # conversion Workspace workspace-specific entry, contract, or helper.
│   │   ├── devWorkspace.js  # dev Workspace workspace-specific entry, contract, or helper.
│   │   ├── documentWorkspace.js  # document Workspace workspace-specific entry, contract, or helper.
│   │   ├── educationWorkspace.js  # education Workspace workspace-specific entry, contract, or helper.
│   │   ├── graphicWorkspace.js  # graphic Workspace workspace-specific entry, contract, or helper.
│   │   ├── iconWorkspace.js  # icon Workspace workspace-specific entry, contract, or helper.
│   │   ├── index.js  # Barrel/export entry for the registry area.
│   │   ├── materialWorkspace.js  # material Workspace workspace-specific entry, contract, or helper.
│   │   ├── mediaWorkspace.js  # media Workspace workspace-specific entry, contract, or helper.
│   │   ├── podcastWorkspace.js  # podcast Workspace workspace-specific entry, contract, or helper.
│   │   ├── resolveWorkspacePolicy.js  # resolve Workspace Policy workspace-specific entry, contract, or helper.
│   │   ├── reviewWorkspace.js  # review Workspace workspace-specific entry, contract, or helper.
│   │   ├── routes.js  # routes module.
│   │   ├── timelineCapability.js  # timeline Capability timeline-related helper or UI surface.
│   │   ├── translateWorkspace.js  # translate Workspace workspace-specific entry, contract, or helper.
│   │   ├── uiuxWorkspace.js  # uiux Workspace workspace-specific entry, contract, or helper.
│   │   ├── videoWorkspace.js  # video Workspace workspace-specific entry, contract, or helper.
│   │   └── WorkspaceDefinition.js  # Workspace Definition workspace-specific entry, contract, or helper.
│   ├── README.md  # Module-level documentation and orientation for this area.
│   └── registry.js  # registry registry/lookup table for feature definitions.
├── world/  # World-space transform helpers.
│   └── applyWorldTransform.js  # apply World Transform module.
├── ....  #  module.
├── .env.local  # Local environment variables for development.
├── .gitignore  # Git ignore rules for local and generated files.
├── .gitmessage  #  module.
├── .mcp.json  # mcp data/config artifact.
├── CONTRIBUTING.md  # Contributor workflow and contribution rules.
├── dropple@0.1.0  # dropple@0 1 module.
├── enforceDroppleLaws.cjs  # enforce Dropple Laws module.
├── eslint.config.mjs  # ESLint configuration and architecture guard wiring.
├── jsconfig.json  # TypeScript/JS path and compiler configuration.
├── next.config.mjs  # Next.js build/runtime configuration.
├── node  # node module.
├── package-lock.json  # Locked npm dependency graph for reproducible installs.
├── package.json  # Repo package manifest with scripts and dependencies.
├── playwright.config.mjs  # Playwright end-to-end test configuration.
├── postcss.config.mjs  # PostCSS/Tailwind processing configuration.
├── quick-context.cjs  # quick context React context and shared state surface.
├── README.md  # Module-level documentation and orientation for this area.
├── RULES_OF_DROPPLE_OS.md  # Repo-specific operating rules and architecture constraints.
├── TESTING.md  # TESTING documentation/spec.
├── tool-ux.md  # tool ux documentation/spec.
├── tree_current.txt  # tree current module.
├── tree_L4.txt  # tree L4 module.
└── tree_L5.txt  # tree L5 module.
```
