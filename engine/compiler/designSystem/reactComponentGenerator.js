import { generateCssVariables } from './cssVariableGenerator.js';

export function generateReactDesignSystem(context) {
    const files = {};

    for (const name of Object.keys(context.designComponents || {}).sort()) {
        const config = context.designComponents[name];
        files[`design-system/react/${name}.jsx`] = generateComponent(name, config);
    }

    files['design-system/react/theme.css'] = generateThemeCss(context);
    files['design-system/tokens/tokens.json'] = JSON.stringify(
        {
            tokens: context.designTokens || {},
            themes: context.themes || {},
            components: context.designComponents || {},
        },
        null,
        2,
    );

    return files;
}

function generateComponent(name, config) {
    const variants = Object.keys(config.variants || {});
    const defaultVariant = variants[0] || 'default';
    const tag = name === 'Button' ? 'button' : 'div';

    return `
export default function ${name}({ variant = "${defaultVariant}", children }) {
  return (
    <${tag} className={\`${name} ${name}--\${variant}\`}>
      {children}
    </${tag}>
  );
}
`.trimStart();
}

function generateThemeCss(context) {
    const light = generateCssVariables(context.themes?.light || {}, ':root');
    const dark = generateCssVariables(context.themes?.dark || {}, '[data-theme="dark"]');

    return `${light}\n${dark}`;
}
