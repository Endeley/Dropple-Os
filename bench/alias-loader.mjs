import { fileURLToPath, pathToFileURL } from 'url';
import { dirname, resolve as pathResolve } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = pathResolve(__dirname, '..');

export function resolve(specifier, context, nextResolve) {
    if (specifier.startsWith('@/')) {
        const target = pathResolve(projectRoot, specifier.slice(2));
        const candidates = /\.[a-z0-9]+$/i.test(target)
            ? [target]
            : [
                  target,
                  `${target}.js`,
                  `${target}.jsx`,
                  `${target}.ts`,
                  `${target}.tsx`,
                  `${target}.mjs`,
                  `${target}.cjs`,
              ];
        const resolvedTarget = candidates.find((candidate) => existsSync(candidate)) ?? candidates[0];
        return {
            url: pathToFileURL(resolvedTarget).href,
            shortCircuit: true,
        };
    }

    return nextResolve(specifier, context);
}
