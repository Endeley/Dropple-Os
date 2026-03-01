import crypto from 'crypto';
import { hashTemplateGraph } from './TemplateHasher.js';
import { validateBehaviorGraph } from '../../core/contracts/BehaviorGraphContract.js';
import { validateSceneGraph } from './SceneGraphContract.js';

/**
 * Hash the engine version snapshot
 * You may replace this with real engine fingerprinting logic
 */
export function hashEngineVersion(engineVersion) {
  if (!engineVersion) {
    throw new Error('Engine version required for certification.');
  }

  return crypto
    .createHash('sha256')
    .update(engineVersion)
    .digest('hex');
}

/**
 * Create cryptographic signature
 */
function signPayload(payload, privateKey) {
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(payload);
  signer.end();
  return signer.sign(privateKey, 'hex');
}

/**
 * Verify signature
 */
function verifySignature(payload, signature, publicKey) {
  const verifier = crypto.createVerify('RSA-SHA256');
  verifier.update(payload);
  verifier.end();
  return verifier.verify(publicKey, signature, 'hex');
}

/**
 * Certify template
 */
export function certifyTemplate({
  template,
  engineVersion,
  privateKey,
}) {
  if (!template || !template.graph) {
    throw new Error('Invalid template structure.');
  }

  // 1. Validate graph
  if (template.mode === 'animation') {
    validateBehaviorGraph(template.graph);
  } else {
    validateSceneGraph(template.graph);
  }

  // 2. Compute hashes
  const structuralHash = hashTemplateGraph(template.graph);
  const engineHash = hashEngineVersion(engineVersion);

  // 3. Create payload
  const payload = structuralHash + engineHash;

  // 4. Sign
  const signature = signPayload(payload, privateKey);

  const certification = Object.freeze({
    structuralHash,
    engineHash,
    signature,
    certifiedAt: new Date().toISOString(),
  });

  return Object.freeze({
    ...template,
    certification,
  });
}

/**
 * Verify certification integrity
 */
export function verifyTemplateCertification({
  template,
  engineVersion,
  publicKey,
}) {
  if (!template.certification) {
    return { valid: false, reason: 'Missing certification stamp.' };
  }

  const { structuralHash, engineHash, signature } = template.certification;

  const currentStructuralHash = hashTemplateGraph(template.graph);
  const currentEngineHash = hashEngineVersion(engineVersion);

  if (structuralHash !== currentStructuralHash) {
    return { valid: false, reason: 'Structural hash mismatch.' };
  }

  if (engineHash !== currentEngineHash) {
    return { valid: false, reason: 'Engine version drift detected.' };
  }

  const payload = structuralHash + engineHash;
  const signatureValid = verifySignature(payload, signature, publicKey);

  if (!signatureValid) {
    return { valid: false, reason: 'Signature verification failed.' };
  }

  return { valid: true };
}
