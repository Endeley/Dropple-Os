import { fileURLToPath, pathToFileURL } from 'url';
import { dirname, resolve as pathResolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = pathResolve(__dirname, '..');

export function resolve(specifier, context, nextResolve) {
    if (specifier.startsWith('@/')) {
        const target = pathResolve(projectRoot, specifier.slice(2));
        // Try exact, then append .js if missing
        const withExt = target.endsWith('.js') ? target : `${target}.js`;
        return {
            url: pathToFileURL(withExt).href,
            shortCircuit: true,
        };
    }

    return nextResolve(specifier, context);
}
