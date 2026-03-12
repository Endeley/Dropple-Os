import fs from 'fs';
import path from 'path';

import { exportReact } from '../export/react/exportReact.js';
import { hashIR } from '../ir/hashIR.js';

export function deployApplication(ir, options = {}) {
    const fingerprint = hashIR(ir);
    const buildDir = options.outputDir || path.join(process.cwd(), 'dropple-build');
    const reactOutput = exportReact(ir);
    const srcDir = path.join(buildDir, 'src');

    fs.mkdirSync(buildDir, { recursive: true });
    fs.mkdirSync(srcDir, { recursive: true });

    const appFile = path.join(srcDir, 'App.jsx');
    const mainFile = path.join(srcDir, 'main.jsx');
    const indexHtml = path.join(buildDir, 'index.html');
    const packageJson = path.join(buildDir, 'package.json');

    fs.writeFileSync(appFile, generateAppFile(reactOutput.code));
    fs.writeFileSync(mainFile, generateMainFile());
    fs.writeFileSync(indexHtml, generateIndexHtml());
    fs.writeFileSync(packageJson, generatePackageJson());

    return {
        fingerprint,
        outputPath: buildDir,
        files: [appFile, mainFile, indexHtml, packageJson],
    };
}

function generateAppFile(code) {
    return `import React from "react"

export default function App() {
  return (
    <>
${indentReactMarkup(code, 6)}
    </>
  )
}
`;
}

function indentReactMarkup(code, spaces) {
    const prefix = ' '.repeat(spaces);
    return String(code)
        .split('\n')
        .filter((line, index, lines) => !(index === lines.length - 1 && line === ''))
        .map((line) => `${prefix}${line}`)
        .join('\n');
}

function generateMainFile() {
    return `import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App.jsx"

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
`;
}

function generateIndexHtml() {
    return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Dropple App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
`;
}

function generatePackageJson() {
    return `${JSON.stringify(
        {
            name: 'dropple-app',
            private: true,
            version: '0.0.0',
            type: 'module',
            dependencies: {
                react: '^18.2.0',
                'react-dom': '^18.2.0',
            },
        },
        null,
        2,
    )}
`;
}
