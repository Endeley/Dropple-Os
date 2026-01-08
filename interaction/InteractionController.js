import { hitTestNode } from './hitTest.js';
import { SelectionModel } from './SelectionModel.js';
import { GuideOverlay } from './guides/GuideOverlay.js';
import { computeSnapPoints } from './guides/computeSnapPoints.js';
import { snapValue } from './guides/snapPosition.js';
import { computeBoundingBox } from './geometry/computeBoundingBox.js';
import { RulerOverlay } from './rulers/RulerOverlay.js';
import { renderRulers } from './rulers/renderRulers.js';
import { MeasurementOverlay } from './measurements/MeasurementOverlay.js';
import { measureToCanvas } from './measurements/computeMeasurements.js';
import { enforceAuthority } from '../runtime/guards/authorityGuard.js';

export class InteractionController {
  constructor({
    shell,
    messageBus,
    canvasContainer,
  }) {
    this.shell = shell;
    this.bus = messageBus;
    this.canvas = canvasContainer;

    this.selection = new SelectionModel();
    this.guides = new GuideOverlay(this.canvas);

    this.activeNodeId = null;
    this.dragStart = null;
    this.resizing = null;
    this.tooltip = this.createTooltip();
    this.rulers = null;
    this.measurements = null;

    if (window.getComputedStyle(this.canvas).position === 'static') {
      this.canvas.style.position = 'relative';
    }

    this.ensureOverlays();
  }

  createTooltip() {
    const el = document.createElement('div');
    Object.assign(el.style, {
      position: 'absolute',
      padding: '4px 6px',
      background: '#111',
      color: '#fff',
      fontSize: '12px',
      borderRadius: '4px',
      pointerEvents: 'none',
      display: 'none',
      zIndex: 1000,
    });
    this.canvas.appendChild(el);
    return el;
  }

  showTooltip(message, e) {
    if (!this.tooltip) return;
    const rect = this.canvas.getBoundingClientRect();
    this.tooltip.textContent = message;
    this.tooltip.style.left = `${e.clientX - rect.left + 8}px`;
    this.tooltip.style.top = `${e.clientY - rect.top + 8}px`;
    this.tooltip.style.display = 'block';
    clearTimeout(this.tooltipTimer);
    this.tooltipTimer = setTimeout(() => {
      if (this.tooltip) this.tooltip.style.display = 'none';
    }, 1200);
  }

  ensureOverlays() {
    const container = this.canvas.parentElement || this.canvas;
    if (window.getComputedStyle(container).position === 'static') {
      container.style.position = 'relative';
    }

    this.rulers = new RulerOverlay(container);
    this.measurements = new MeasurementOverlay(container);
  }

  renderRulers() {
    if (!this.rulers) return;
    const rect = this.canvas.getBoundingClientRect();
    renderRulers(this.rulers.hRuler, rect.width, 'horizontal');
    renderRulers(this.rulers.vRuler, rect.height, 'vertical');
  }

  onWindowResize = () => {
    this.renderRulers();
  };

  mount() {
    this.canvas.addEventListener('mousedown', this.onMouseDown);
    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('mouseup', this.onMouseUp);
    window.addEventListener('resize', this.onWindowResize);
    this.renderRulers();
  }

  unmount() {
    this.canvas.removeEventListener('mousedown', this.onMouseDown);
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('mouseup', this.onMouseUp);
    window.removeEventListener('resize', this.onWindowResize);
  }

  onMouseDown = (e) => {
    try {
      enforceAuthority(this.shell, 'drag');
    } catch (err) {
      return;
    }
    const nodeId = hitTestNode(e);

    if (!nodeId) {
      this.selection.clear();
      return;
    }

    const additive = e.shiftKey;
    this.selection.select(nodeId, additive);

    const state = this.shell.getCurrentState();
    const ids = [...this.selection.selectedIds];
    if (!ids.length) return;
    this.activeNodeId = ids[ids.length - 1];
    const primary = state.nodes[this.activeNodeId];
    if (primary?.parentId) {
      const parent = state.nodes[primary.parentId];
      if (
        parent?.layout?.display === 'flex' ||
        parent?.layout?.display === 'grid'
      ) {
        this.showTooltip('Controlled by auto-layout', e);
        this.activeNodeId = null;
        return;
      }
    }
    this.dragStart = {
      x: e.clientX,
      y: e.clientY,
      nodes: ids.map((id) => {
        const node = state.nodes[id];
        return {
          id,
          startX: node?.layout?.x ?? 0,
          startY: node?.layout?.y ?? 0,
        };
      }),
    };
  };

  onMouseMove = (e) => {
    try {
      enforceAuthority(this.shell, 'drag-preview');
    } catch (err) {
      return;
    }
    if (this.resizing) {
      const { startX, startY, box, nodes } = this.resizing;

      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      const scaleX = (box.width + dx) / box.width;
      const scaleY = (box.height + dy) / box.height;

      for (const n of nodes) {
        const el = this.canvas.querySelector(
          `[data-node-id="${n.id}"]`
        );
        if (!el) continue;

        const relX = n.x - box.x;
        const relY = n.y - box.y;

        el.style.left = `${box.x + relX * scaleX}px`;
        el.style.top = `${box.y + relY * scaleY}px`;
        el.style.width = `${n.width * scaleX}px`;
        el.style.height = `${n.height * scaleY}px`;
      }

      this.measurements.clear();
      const measures = measureToCanvas({ x: box.x, y: box.y });
      for (const m of measures) {
        this.measurements.drawLine(m);
      }

      return;
    }

    if (!this.dragStart || !this.dragStart.nodes?.length) return;

    const dx = e.clientX - this.dragStart.x;
    const dy = e.clientY - this.dragStart.y;

    if (this.dragStart.nodes.length > 1) {
      for (const n of this.dragStart.nodes) {
        const el = this.canvas.querySelector(
          `[data-node-id="${n.id}"]`
        );
        if (!el) continue;

        el.style.left = `${n.startX + dx}px`;
        el.style.top = `${n.startY + dy}px`;
      }

      this.guides.clear();
      this.measurements.clear();
      return;
    }

    const primary = this.dragStart.nodes[0];
    const state = this.shell.getCurrentState();
    if (!state.nodes[primary.id]) return;

    let nextX = primary.startX + dx;
    let nextY = primary.startY + dy;

    const { xs, ys } = computeSnapPoints(state, primary.id);

    nextX = snapValue(nextX, xs);
    nextY = snapValue(nextY, ys);

    const el = this.canvas.querySelector(
      `[data-node-id="${primary.id}"]`
    );

    if (el) {
      el.style.left = `${nextX}px`;
      el.style.top = `${nextY}px`;
    }

    this.guides.showVertical(nextX);
    this.guides.showHorizontal(nextY);
    this.measurements.clear();
    const measures = measureToCanvas({ x: nextX, y: nextY });
    for (const m of measures) {
      this.measurements.drawLine(m);
    }
  };

  onMouseUp = (e) => {
    try {
      enforceAuthority(this.shell, 'drag-commit');
    } catch (err) {
      return;
    }
    if (this.resizing) {
      const { startX, startY, box, nodes } = this.resizing;

      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      const scaleX = (box.width + dx) / box.width;
      const scaleY = (box.height + dy) / box.height;

      for (const n of nodes) {
        const el = this.canvas.querySelector(
          `[data-node-id="${n.id}"]`
        );
        if (el) {
          el.style.left = '';
          el.style.top = '';
          el.style.width = '';
          el.style.height = '';
        }

        const relX = n.x - box.x;
        const relY = n.y - box.y;

        this.bus.emit({
          type: 'node.layout.update',
          payload: {
            nodeId: n.id,
            layout: {
              x: box.x + relX * scaleX,
              y: box.y + relY * scaleY,
              width: n.width * scaleX,
              height: n.height * scaleY,
            },
          },
        });
      }

      this.resizing = null;
      this.measurements.clear();
      return;
    }

    if (!this.dragStart || !this.dragStart.nodes?.length) return;

    const dx = e.clientX - this.dragStart.x;
    const dy = e.clientY - this.dragStart.y;

    if (this.dragStart.nodes.length > 1) {
      for (const n of this.dragStart.nodes) {
        const el = this.canvas.querySelector(
          `[data-node-id="${n.id}"]`
        );
        if (el) {
          el.style.left = '';
          el.style.top = '';
        }

        this.bus.emit({
          type: 'node.layout.update',
          payload: {
            nodeId: n.id,
            layout: {
              x: n.startX + dx,
              y: n.startY + dy,
            },
          },
        });
      }

      this.dragStart = null;
      this.activeNodeId = null;
      this.guides.clear();
      this.measurements.clear();
      return;
    }

    const primary = this.dragStart.nodes[0];
    const state = this.shell.getCurrentState();
    if (!state.nodes[primary.id]) {
      this.dragStart = null;
      this.activeNodeId = null;
      this.guides.clear();
      this.measurements.clear();
      return;
    }

    let nextX = primary.startX + dx;
    let nextY = primary.startY + dy;

    const { xs, ys } = computeSnapPoints(state, primary.id);
    nextX = snapValue(nextX, xs);
    nextY = snapValue(nextY, ys);

    const el = this.canvas.querySelector(
      `[data-node-id="${primary.id}"]`
    );

    if (el) {
      el.style.left = '';
      el.style.top = '';
    }

    this.bus.emit({
      type: 'node.layout.update',
      payload: {
        nodeId: primary.id,
        layout: {
          x: nextX,
          y: nextY,
        },
      },
    });

    this.dragStart = null;
    this.activeNodeId = null;
    this.guides.clear();
    this.measurements.clear();
  };

  onResizeStart = (e) => {
    try {
      enforceAuthority(this.shell, 'resize-start');
    } catch (err) {
      return;
    }
    const state = this.shell.getCurrentState();
    const ids = [...this.selection.selectedIds];
    if (!ids.length) return;

    const primary = state.nodes[ids[ids.length - 1]];
    if (primary?.parentId) {
      const parent = state.nodes[primary.parentId];
      if (
        parent?.layout?.display === 'flex' ||
        parent?.layout?.display === 'grid'
      ) {
        this.showTooltip('Controlled by auto-layout', e);
        return;
      }
    }

    const nodes = ids
      .map((id) => {
        const n = state.nodes[id];
        if (!n?.layout) return null;
        return {
          id,
          x: n.layout.x,
          y: n.layout.y,
          width: n.layout.width,
          height: n.layout.height,
        };
      })
      .filter(Boolean);

    if (!nodes.length) return;

    const box = computeBoundingBox(nodes);

    this.resizing = {
      startX: e.clientX,
      startY: e.clientY,
      box,
      nodes,
    };
  };

}
