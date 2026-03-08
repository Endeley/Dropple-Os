import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { certifyTemplate } from '../TemplateCertification.js';

function buildTemplate({ id, version }) {
  return {
    id,
    version,
    mode: 'animation',
    graph: {
      baseStateId: 'state:base',
      states: [
        { id: 'state:base', label: 'Base', propertyOverrides: {}, domainMeta: {} },
      ],
      transitions: [],
      triggers: [],
    },
    metadata: {
      name: 'Behavior Template',
      description: 'Fixture',
      author: 'Dropple',
      createdAt: '2026-02-01',
      compatibleEngineVersion: 'dropple-motion@1.x',
      tags: ['test'],
    },
  };
}

const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
});

const engineVersion = 'dropple-motion@1.x';

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dropple-registry-'));
const originalCwd = process.cwd();

process.chdir(tempDir);

const { registerTemplate } = await import('../TemplateRegistry.js');

try {
  const templateA = buildTemplate({ id: 'tpl-a', version: '1.0.0' });
  const certifiedA = certifyTemplate({ template: templateA, engineVersion, privateKey });

  const result = registerTemplate({ template: certifiedA, engineVersion, publicKey });
  if (!result.registered) {
    throw new Error('Expected successful registration');
  }

  let duplicateOk = false;
  try {
    registerTemplate({ template: certifiedA, engineVersion, publicKey });
    duplicateOk = true;
  } catch (err) {
    // expected
  }
  if (duplicateOk) {
    throw new Error('Expected duplicate id+version rejection');
  }

  const templateB = buildTemplate({ id: 'tpl-a', version: '1.1.0' });
  const certifiedB = certifyTemplate({ template: templateB, engineVersion, privateKey });
  registerTemplate({ template: certifiedB, engineVersion, publicKey });

  const templateC = buildTemplate({ id: 'tpl-a', version: '1.0.0' });
  const certifiedC = certifyTemplate({ template: templateC, engineVersion, privateKey });
  let downgradeOk = false;
  try {
    registerTemplate({ template: certifiedC, engineVersion, publicKey });
    downgradeOk = true;
  } catch (err) {
    // expected
  }
  if (downgradeOk) {
    throw new Error('Expected version downgrade rejection');
  }

  const tamperedSignature = {
    ...certifiedB,
    certification: {
      ...certifiedB.certification,
      signature: (() => {
        const original = certifiedB.certification.signature;
        const last = original.slice(-1);
        const flipped = last === '0' ? '1' : '0';
        return original.slice(0, -1) + flipped;
      })(),
    },
  };
  let tamperOk = false;
  try {
    registerTemplate({ template: tamperedSignature, engineVersion, publicKey });
    tamperOk = true;
  } catch (err) {
    // expected
  }
  if (tamperOk) {
    throw new Error('Expected tampered signature rejection');
  }

  let driftOk = false;
  try {
    registerTemplate({ template: certifiedB, engineVersion: 'dropple-motion@2.x', publicKey });
    driftOk = true;
  } catch (err) {
    // expected
  }
  if (driftOk) {
    throw new Error('Expected engine drift rejection');
  }

  const mutated = {
    ...certifiedB,
    graph: {
      ...certifiedB.graph,
      states: [
        ...certifiedB.graph.states,
        { id: 'state:mut', label: 'Mut', propertyOverrides: {}, domainMeta: {} },
      ],
    },
  };
  let mutationOk = false;
  try {
    registerTemplate({ template: mutated, engineVersion, publicKey });
    mutationOk = true;
  } catch (err) {
    // expected
  }
  if (mutationOk) {
    throw new Error('Expected structural mutation rejection');
  }

  console.log('TEMPLATE REGISTRY TESTS: OK');
} finally {
  process.chdir(originalCwd);
}
