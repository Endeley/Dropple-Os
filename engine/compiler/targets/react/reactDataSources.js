import { buildFetchOptions } from '../../application/data/dataFetch.js';

export function buildReactDataSources(context) {
    const sources = context.application?.dataSources || [];

    return sources
        .map(buildReactDataHook)
        .join('\n\n  ');
}

export function buildReactDataEffects(context) {
    const sources = context.application?.dataSources || [];

    return sources
        .map((source) => {
            const name = capitalize(source.id);

            return `
React.useEffect(() => {
    fetch${name}();
}, []);
`.trim();
        })
        .join('\n\n  ');
}

export function buildReactDataProps(context, scope = 'local') {
    const sources = context.application?.dataSources || [];

    return sources
        .flatMap((source) => {
            const name = capitalize(source.id);
            return [
                `${source.id}={${readScope(scope, source.id)}}`,
                `${source.id}Loading={${readScope(scope, `${source.id}Loading`)}}`,
                `${source.id}Error={${readScope(scope, `${source.id}Error`)}}`,
                `fetch${name}={${readScope(scope, `fetch${name}`)}}`,
            ];
        })
        .join(' ');
}

function buildReactDataHook(source) {
    const name = capitalize(source.id);
    const options = serializeFetchOptions(buildFetchOptions(source));

    return `
const [${source.id}, set${name}] = React.useState(null);
const [${source.id}Loading, set${name}Loading] = React.useState(false);
const [${source.id}Error, set${name}Error] = React.useState(null);

async function fetch${name}() {
  set${name}Loading(true);
  set${name}Error(null);

  try {
    const res = await fetch(${JSON.stringify(source.url)}, ${options});
    const json = await res.json();
    set${name}(json);
  } catch (err) {
    set${name}Error(err);
  } finally {
    set${name}Loading(false);
  }
}
`.trim();
}

function serializeFetchOptions(options) {
    const body = Object.entries(options)
        .map(([key, value]) => {
            if (typeof value === 'string') {
                return `${key}: ${JSON.stringify(value)}`;
            }

            return `${key}: ${JSON.stringify(value, null, 2)}`;
        })
        .join(', ');

    return `{ ${body} }`;
}

function readScope(scope, name) {
    return scope === 'props' ? `props.${name}` : name;
}

function capitalize(value) {
    return value.charAt(0).toUpperCase() + value.slice(1);
}
