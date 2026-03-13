function toJson(value) {
    return JSON.stringify(value, null, 2);
}

function generateComponentFile(component) {
    const variants = toJson(component.variants || {});
    const defaultVariant = component.defaultVariant || 'default';
    const tag = component.tag || 'div';

    return `
import React from "react";

const variants = ${variants};

export default function ${component.name}({ variant = "${defaultVariant}", children, style, ...props }) {
  const variantStyle = variants[variant] || {};
  const ComponentTag = "${tag}";

  return (
    <ComponentTag style={{ ...variantStyle, ...style }} {...props}>
      {children}
    </ComponentTag>
  );
}
`.trimStart();
}

function generateIndexFile(components) {
    return Object.keys(components)
        .sort()
        .map((name) => `export { default as ${name} } from "./${name}.jsx";`)
        .join('\n');
}

function generateThemeModule(themes) {
    return `
export const themes = ${toJson(themes)};

export default themes;
`.trimStart();
}

function generateTokensModule(tokens) {
    return `
export const tokens = ${toJson(tokens)};

export default tokens;
`.trimStart();
}

function generatePackageJson({ packageName, componentNames }) {
    return toJson({
        name: packageName,
        private: true,
        type: 'module',
        exports: {
            '.': './index.js',
            './tokens': './tokens.js',
            './themes': './themes.js',
        },
        sideEffects: false,
        peerDependencies: {
            react: '^19.0.0',
        },
        dropple: {
            components: componentNames,
        },
    });
}

export function generateLibrary(components = {}, { tokens = {}, themes = {}, packageName = '@dropple/design-system' } = {}) {
    const files = {};
    const componentNames = Object.keys(components).sort();

    for (const name of componentNames) {
        files[`design-system/react/${name}.jsx`] = generateComponentFile(components[name]);
    }

    files['design-system/react/index.js'] = generateIndexFile(components);
    files['design-system/react/tokens.js'] = generateTokensModule(tokens);
    files['design-system/react/themes.js'] = generateThemeModule(themes);
    files['design-system/react/package.json'] = generatePackageJson({
        packageName,
        componentNames,
    });

    return files;
}
