'use client';

import { getInspectableGraphFields, getGraphNodeDefinition } from './graphNodeCatalog.js';

function cardSection(title, children) {
    return (
        <section
            style={{
                padding: 12,
                borderRadius: 12,
                border: '1px solid rgba(148, 163, 184, 0.12)',
                background: 'rgba(15, 23, 42, 0.56)',
            }}>
            <div
                style={{
                    marginBottom: 10,
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: '#93c5fd',
                }}>
                {title}
            </div>
            {children}
        </section>
    );
}

function fieldRow(label, control) {
    return (
        <label
            style={{
                display: 'grid',
                gap: 6,
                marginBottom: 10,
            }}>
            <span style={{ fontSize: 11, color: '#94a3b8' }}>{label}</span>
            {control}
        </label>
    );
}

function inputStyle() {
    return {
        width: '100%',
        borderRadius: 10,
        border: '1px solid rgba(148, 163, 184, 0.2)',
        background: 'rgba(2, 6, 23, 0.44)',
        color: '#e2e8f0',
        padding: '8px 10px',
        fontSize: 12,
    };
}

function toInputValue(value) {
    if (Array.isArray(value)) {
        return value.join(', ');
    }

    if (value == null) {
        return '';
    }

    return String(value);
}

function parseFieldValue(field, value) {
    if (field === 'chain') {
        return value
            .split(',')
            .map((part) => part.trim())
            .filter(Boolean);
    }

    if (field === 'mode' || field === 'id' || field === 'name' || field === 'controllerId' || field === 'channel') {
        return value;
    }

    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : 0;
}

function fieldLabel(field) {
    switch (field) {
        case 'controllerId':
            return 'Controller';
        case 'channel':
            return 'Channel';
        case 'inMin':
            return 'Input Min';
        case 'inMax':
            return 'Input Max';
        case 'outMin':
            return 'Output Min';
        case 'outMax':
            return 'Output Max';
        default:
            return field.charAt(0).toUpperCase() + field.slice(1);
    }
}

export function GraphInspectorPanel({
    activeGraph,
    selectedNode,
    graphErrors = [],
    onPatchGraph,
    onPatchNode,
    onDeleteNode,
    onSetOutputNode,
}) {
    if (!activeGraph) {
        return (
            <aside
                style={{
                    width: 244,
                    padding: 12,
                    borderLeft: '1px solid rgba(148, 163, 184, 0.12)',
                    background: 'rgba(2, 6, 23, 0.3)',
                    color: '#94a3b8',
                    fontSize: 12,
                }}>
                No active graph selected.
            </aside>
        );
    }

    const nodeDefinition = getGraphNodeDefinition(selectedNode?.type);
    const inspectableFields = selectedNode ? getInspectableGraphFields(selectedNode) : [];

    return (
        <aside
            style={{
                width: 244,
                padding: 12,
                borderLeft: '1px solid rgba(148, 163, 184, 0.12)',
                background: 'rgba(2, 6, 23, 0.3)',
                overflowY: 'auto',
                color: '#e2e8f0',
            }}>
            {cardSection(
                'Graph',
                <div style={{ display: 'grid', gap: 6 }}>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{activeGraph.id}</div>
                    {fieldRow(
                        'Enabled',
                        <label
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                fontSize: 12,
                                color: '#e2e8f0',
                            }}>
                            <input
                                type='checkbox'
                                checked={activeGraph.enabled !== false}
                                onChange={(event) =>
                                    onPatchGraph?.({
                                        enabled: event.target.checked,
                                    })
                                }
                            />
                            <span>{activeGraph.enabled !== false ? 'Participates in runtime evaluation' : 'Excluded from runtime evaluation'}</span>
                        </label>,
                    )}
                    {fieldRow(
                        'Rig Id',
                        <input
                            value={toInputValue(activeGraph.rigId)}
                            onChange={(event) =>
                                onPatchGraph?.({
                                    rigId: event.target.value.trim() || null,
                                })
                            }
                            placeholder='optional rig binding'
                            style={inputStyle()}
                        />,
                    )}
                    <div style={{ fontSize: 12, color: '#94a3b8' }}>
                        Output: {activeGraph.output ?? 'not set'}
                    </div>
                    {graphErrors.length ? (
                        <div style={{ marginTop: 6, fontSize: 12, color: '#fda4af' }}>
                            {graphErrors.length} graph issue{graphErrors.length === 1 ? '' : 's'} surfaced by runtime validation.
                        </div>
                    ) : (
                        <div style={{ marginTop: 6, fontSize: 12, color: '#86efac' }}>
                            No active graph validation errors.
                        </div>
                    )}
                </div>,
            )}

            <div style={{ height: 12 }} />

            {!selectedNode
                ? cardSection(
                      'Selection',
                      <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5 }}>
                          Select a node to inspect and update its authored graph fields.
                      </div>,
                  )
                : (
                      <>
                          {cardSection(
                              'Node',
                              <div>
                                  {fieldRow(
                                      'Node Id',
                                      <input
                                          value={selectedNode.id ?? ''}
                                          readOnly
                                          style={inputStyle()}
                                      />,
                                  )}
                                  <div style={{ marginBottom: 10, fontSize: 12, color: '#94a3b8', lineHeight: 1.45 }}>
                                      {nodeDefinition?.summary ?? 'Graph node selected.'}
                                  </div>
                                  <div style={{ display: 'flex', gap: 8 }}>
                                      <button
                                          type='button'
                                          onClick={() => onSetOutputNode?.(selectedNode.id)}
                                          style={{
                                              flex: 1,
                                              padding: '8px 10px',
                                              borderRadius: 10,
                                              border: '1px solid rgba(96, 165, 250, 0.35)',
                                              background:
                                                  activeGraph.output === selectedNode.id
                                                      ? 'rgba(59, 130, 246, 0.22)'
                                                      : 'rgba(15, 23, 42, 0.72)',
                                              color: '#e2e8f0',
                                              cursor: 'pointer',
                                          }}>
                                          {activeGraph.output === selectedNode.id ? 'Output Node' : 'Set Output'}
                                      </button>
                                      <button
                                          type='button'
                                          onClick={() => onDeleteNode?.(selectedNode.id)}
                                          style={{
                                              padding: '8px 10px',
                                              borderRadius: 10,
                                              border: '1px solid rgba(244, 63, 94, 0.35)',
                                              background: 'rgba(127, 29, 29, 0.28)',
                                              color: '#fecdd3',
                                              cursor: 'pointer',
                                          }}>
                                          Delete
                                      </button>
                                  </div>
                              </div>,
                          )}

                          <div style={{ height: 12 }} />

                          {cardSection(
                              'Fields',
                              <div>
                                  {fieldRow(
                                      'Type',
                                      <input value={selectedNode.type ?? ''} readOnly style={inputStyle()} />,
                                  )}
                                  {inspectableFields.length ? (
                                      inspectableFields.map((field) =>
                                          fieldRow(
                                              fieldLabel(field),
                                              field === 'mode' ? (
                                                  <select
                                                      value={toInputValue(selectedNode[field]) || 'linear'}
                                                      onChange={(event) =>
                                                          onPatchNode?.(selectedNode.id, {
                                                              [field]: parseFieldValue(field, event.target.value),
                                                          })
                                                      }
                                                      style={inputStyle()}>
                                                      <option value='linear'>linear</option>
                                                      <option value='easeIn'>easeIn</option>
                                                      <option value='easeOut'>easeOut</option>
                                                      <option value='easeInOut'>easeInOut</option>
                                                  </select>
                                              ) : (
                                                  <input
                                                      value={toInputValue(selectedNode[field])}
                                                      onChange={(event) =>
                                                          onPatchNode?.(selectedNode.id, {
                                                              [field]: parseFieldValue(field, event.target.value),
                                                          })
                                                      }
                                                      style={inputStyle()}
                                                  />
                                              ),
                                          ),
                                      )
                                  ) : (
                                      <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5 }}>
                                          This node is controlled by its connections and has no extra authored fields.
                                      </div>
                                  )}
                              </div>,
                          )}

                          <div style={{ height: 12 }} />

                          {cardSection(
                              'Layout',
                              <div>
                                  {fieldRow(
                                      'Position X',
                                      <input
                                          value={toInputValue(selectedNode.position?.x ?? 0)}
                                          onChange={(event) =>
                                              onPatchNode?.(selectedNode.id, {
                                                  position: {
                                                      x: Number(event.target.value) || 0,
                                                  },
                                              })
                                          }
                                          style={inputStyle()}
                                      />,
                                  )}
                                  {fieldRow(
                                      'Position Y',
                                      <input
                                          value={toInputValue(selectedNode.position?.y ?? 0)}
                                          onChange={(event) =>
                                              onPatchNode?.(selectedNode.id, {
                                                  position: {
                                                      y: Number(event.target.value) || 0,
                                                  },
                                              })
                                          }
                                          style={inputStyle()}
                                      />,
                                  )}
                              </div>,
                          )}
                      </>
                  )}
        </aside>
    );
}
