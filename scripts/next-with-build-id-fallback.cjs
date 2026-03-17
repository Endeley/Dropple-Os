const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const replacements = [
  {
    file: path.resolve(__dirname, '../node_modules/next/dist/build/generate-build-id.js'),
    before: '    let buildId = await generate();',
    after: [
      '    const safeGenerate = typeof generate === "function" ? generate : ()=>null;',
      '    let buildId = await safeGenerate();',
    ].join('\n'),
  },
  {
    file: path.resolve(__dirname, '../node_modules/next/dist/esm/build/generate-build-id.js'),
    before: '    let buildId = await generate();',
    after: [
      '    const safeGenerate = typeof generate === "function" ? generate : ()=>null;',
      '    let buildId = await safeGenerate();',
    ].join('\n'),
  },
  {
    file: path.resolve(__dirname, '../node_modules/next/dist/build/swc/index.js'),
    before: '        nextConfigSerializable.distDirRoot = normalizePathOnWindows(nextConfigSerializable.distDirRoot);',
    after:
      '        nextConfigSerializable.distDirRoot = normalizePathOnWindows(nextConfigSerializable.distDirRoot || nextConfigSerializable.distDir || ".next");',
  },
  {
    file: path.resolve(__dirname, '../node_modules/next/dist/esm/build/swc/index.js'),
    before: '        nextConfigSerializable.distDirRoot = normalizePathOnWindows(nextConfigSerializable.distDirRoot);',
    after:
      '        nextConfigSerializable.distDirRoot = normalizePathOnWindows(nextConfigSerializable.distDirRoot || nextConfigSerializable.distDir || ".next");',
  },
];

for (const { file, before, after } of replacements) {
  const source = fs.readFileSync(file, 'utf8');
  if (!source.includes(after)) {
    if (!source.includes(before)) {
      throw new Error(`Unable to patch Next build-id fallback in ${file}`);
    }
    fs.writeFileSync(file, source.replace(before, after));
  }
}

const nextBin = path.resolve(__dirname, '../node_modules/next/dist/bin/next');
const result = spawnSync(process.execPath, [nextBin, ...process.argv.slice(2)], {
  stdio: 'inherit',
  env: process.env,
});

if (result.error) {
  throw result.error;
}

process.exit(result.status ?? 1);
