import { renderReactLayout } from './reactLayout.js';
import { renderReactStyles } from './reactStyles.js';

export function renderReactProject(context) {
    const components = (context.structure || [])
        .map((node) => {
            const style = {
                ...renderReactLayout(node.id, context.layout || {}),
                ...renderReactStyles(node.id, context.styles || {}),
            };
            const styleProp = serializeStyle(style);

            return `      <div id="${node.id}"${styleProp}></div>`;
        })
        .join('\n');

    return `
export default function App() {
  return (
    <div>
${components}
    </div>
  );
}
`.trimStart();
}

function serializeStyle(style) {
    const entries = Object.entries(style);
    if (entries.length === 0) {
        return '';
    }

    const body = entries
        .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
        .join(', ');

    return ` style={{ ${body} }}`;
}
