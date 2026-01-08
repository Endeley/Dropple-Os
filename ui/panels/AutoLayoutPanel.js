export class AutoLayoutPanel {
  constructor({ container, shell, interactions, messageBus }) {
    this.container = container;
    this.shell = shell;
    this.selection = interactions.selection;
    this.bus = messageBus;

    this.unsubscribe = null;
  }

  mount() {
    this.unsubscribe = this.selection.subscribe(() => this.render());
    this.render();
  }

  unmount() {
    if (this.unsubscribe) this.unsubscribe();
  }

  render() {
    this.container.innerHTML = '';

    const ids = [...this.selection.selectedIds];
    if (ids.length !== 1) {
      this.container.textContent = 'Select a single container';
      return;
    }

    const state = this.shell.getCurrentState();
    const node = state.nodes[ids[0]];
    if (!node) return;

    this.renderControls(node);
  }

  renderControls(node) {
    const layout = node.layout || {};
    const display = layout.display || '';
    const flexDirection = layout.flexDirection || 'row';
    const justifyContent = layout.justifyContent || 'flex-start';
    const alignItems = layout.alignItems || 'stretch';
    const gridTemplateColumns = layout.gridTemplateColumns || '';
    const gridTemplateRows = layout.gridTemplateRows || '';

    this.container.innerHTML = `
      <h3>Auto Layout</h3>

      <label>
        Mode:
        <select data-key="display">
          <option value="">None</option>
          <option value="flex" ${display === 'flex' ? 'selected' : ''}>Flex</option>
          <option value="grid" ${display === 'grid' ? 'selected' : ''}>Grid</option>
        </select>
      </label>

      ${display === 'flex' ? `
        <label>
          Direction:
          <select data-key="flexDirection">
            <option value="row" ${flexDirection === 'row' ? 'selected' : ''}>Row</option>
            <option value="column" ${flexDirection === 'column' ? 'selected' : ''}>Column</option>
          </select>
        </label>

        <label>
          Justify:
          <select data-key="justifyContent">
            <option value="flex-start" ${justifyContent === 'flex-start' ? 'selected' : ''}>Start</option>
            <option value="center" ${justifyContent === 'center' ? 'selected' : ''}>Center</option>
            <option value="space-between" ${justifyContent === 'space-between' ? 'selected' : ''}>Space Between</option>
          </select>
        </label>

        <label>
          Align:
          <select data-key="alignItems">
            <option value="stretch" ${alignItems === 'stretch' ? 'selected' : ''}>Stretch</option>
            <option value="center" ${alignItems === 'center' ? 'selected' : ''}>Center</option>
          </select>
        </label>
      ` : ''}

      ${display === 'grid' ? `
        <label>
          Columns:
          <input data-key="gridTemplateColumns" value="${gridTemplateColumns}" placeholder="e.g. 1fr 1fr" />
        </label>

        <label>
          Rows:
          <input data-key="gridTemplateRows" value="${gridTemplateRows}" placeholder="e.g. auto auto" />
        </label>
      ` : ''}

      <label>
        Gap:
        <input type="number" data-key="gap" value="${layout.gap ?? 0}" />
      </label>

      <label>
        Padding:
        <input type="number" data-key="padding" value="${layout.padding ?? 0}" />
      </label>
    `;

    this.bindControls(node.id);
  }

  bindControls(nodeId) {
    this.container.querySelectorAll('[data-key]').forEach((el) => {
      el.addEventListener('change', () => {
        const key = el.dataset.key;
        const value =
          el.type === 'number' ? Number(el.value) : el.value || null;

        this.bus.emit({
          type: 'node.layout.update',
          payload: {
            nodeId,
            layout: {
              [key]: value,
            },
          },
        });
      });
    });
  }
}
