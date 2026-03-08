import crypto from 'crypto';
import { certifyTemplate, verifyTemplateCertification } from '../TemplateCertification.js';

function buildTemplate() {
  return {
    id: 'behavior-template',
    version: '1.0.0',
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

const template = buildTemplate();
const certified = certifyTemplate({ template, engineVersion, privateKey });

const valid = verifyTemplateCertification({
  template: certified,
  engineVersion,
  publicKey,
});

if (!valid.valid) {
  throw new Error(`Expected certification valid, got: ${valid.reason}`);
}

const tamperedSignature = {
  ...certified,
  certification: {
    ...certified.certification,
    signature: (() => {
      const original = certified.certification.signature;
      const last = original.slice(-1);
      const flipped = last === '0' ? '1' : '0';
      return original.slice(0, -1) + flipped;
    })(),
  },
};
const tamperedSignatureResult = verifyTemplateCertification({
  template: tamperedSignature,
  engineVersion,
  publicKey,
});
if (tamperedSignatureResult.valid) {
  throw new Error('Expected signature tampering to fail');
}

const driftResult = verifyTemplateCertification({
  template: certified,
  engineVersion: 'dropple-motion@2.x',
  publicKey,
});
if (driftResult.valid) {
  throw new Error('Expected engine drift to fail');
}

const mutatedGraph = {
  ...certified,
  graph: {
    ...certified.graph,
    states: [
      ...certified.graph.states,
      { id: 'state:new', label: 'New', propertyOverrides: {}, domainMeta: {} },
    ],
  },
};
const mutationResult = verifyTemplateCertification({
  template: mutatedGraph,
  engineVersion,
  publicKey,
});
if (mutationResult.valid) {
  throw new Error('Expected structural mutation to fail');
}

console.log('TEMPLATE CERTIFICATION TESTS: OK');
