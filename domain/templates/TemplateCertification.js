import crypto from 'crypto';
import { hashTemplateGraph } from './TemplateHasher.js';
import { validateBehaviorGraph } from '../../core/contracts/BehaviorGraphContract.js';
import { validateSceneGraph } from './SceneGraphContract.js';
import { certifyTemplateSeed } from '../../engine/templates/certifyTemplateSeed.js';
import { compileTemplateV1 } from '../../engine/templates/templateCompilerV1.js';

function isSeedTemplate(template) {
    return Boolean(
        template &&
            typeof template === 'object' &&
            template.baseSceneGraph &&
            template.states &&
            typeof template.defaultState === 'string',
    );
}

function isTemplateArtifact(template) {
    return Boolean(
        template &&
            typeof template === 'object' &&
            template.metadata &&
            template.structure &&
            template.motion &&
            template.params &&
            template.runtime,
    );
}

function stripSeedCertification(seed) {
    if (!seed || typeof seed !== 'object') return seed;

    return {
        ...seed,
        certification: undefined,
    };
}

/**
 * Hash the engine version snapshot.
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

export function registerTemplateCertification({
    certification = {},
    engineVersion,
}) {
    const resolvedEngineVersion =
        engineVersion ?? certification?.engineVersion ?? 'dropple-motion@1.x';

    return {
        ...certification,
        engineVersion: resolvedEngineVersion,
        engineHash: hashEngineVersion(resolvedEngineVersion),
    };
}

function normalizeCertifiedSeed(seed, engineVersion) {
    const certified = certifyTemplateSeed(stripSeedCertification(seed));
    return {
        ...certified,
        certification: registerTemplateCertification({
            certification: certified.certification,
            engineVersion,
        }),
    };
}

function signPayload(payload, privateKey) {
    const signer = crypto.createSign('RSA-SHA256');
    signer.update(payload);
    signer.end();
    return signer.sign(privateKey, 'hex');
}

function verifySignature(payload, signature, publicKey) {
    const verifier = crypto.createVerify('RSA-SHA256');
    verifier.update(payload);
    verifier.end();
    return verifier.verify(publicKey, signature, 'hex');
}

function certifyLegacyTemplate({
    template,
    engineVersion,
    privateKey,
}) {
    if (!template || !template.graph) {
        throw new Error('Invalid template structure.');
    }

    if (template.mode === 'animation') {
        validateBehaviorGraph(template.graph);
    } else {
        validateSceneGraph(template.graph);
    }

    const structuralHash = hashTemplateGraph(template.graph);
    const engineHash = hashEngineVersion(engineVersion);
    const payload = structuralHash + engineHash;
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

function verifyLegacyTemplateCertification({
    template,
    engineVersion,
    publicKey,
}) {
    if (!template?.certification) {
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

/**
 * Certify template.
 *
 * Canonical path:
 * CCM artifact -> compiled seed -> replay-derived certification.
 *
 * Legacy graph templates remain supported for compatibility only.
 */
export function certifyTemplate({
    template,
    engineVersion,
    privateKey,
}) {
    if (isTemplateArtifact(template)) {
        const { seed } = compileTemplateV1(template);
        return normalizeCertifiedSeed(seed, engineVersion ?? template.metadata?.engine);
    }

    if (isSeedTemplate(template)) {
        return normalizeCertifiedSeed(
            template,
            engineVersion ?? template?.certification?.engineVersion ?? template?.metadata?.engine,
        );
    }

    return certifyLegacyTemplate({
        template,
        engineVersion,
        privateKey,
    });
}

/**
 * Verify certification integrity.
 */
export function verifyTemplateCertification({
    template,
    engineVersion,
    publicKey,
}) {
    if (isSeedTemplate(template)) {
        if (!template?.certification) {
            return { valid: false, reason: 'Missing certification stamp.' };
        }

        const expected = normalizeCertifiedSeed(
            template,
            engineVersion ?? template.certification?.engineVersion ?? template?.metadata?.engine,
        );
        const actual = registerTemplateCertification({
            certification: template.certification,
            engineVersion:
                engineVersion ?? template.certification?.engineVersion ?? template?.metadata?.engine,
        });
        const expectedCertification = registerTemplateCertification({
            certification: expected.certification,
            engineVersion:
                engineVersion ?? expected.certification?.engineVersion ?? template?.metadata?.engine,
        });

        if (actual.engineVersion !== expectedCertification.engineVersion) {
            return { valid: false, reason: 'Engine version drift detected.' };
        }
        if (actual.engineHash !== expectedCertification.engineHash) {
            return { valid: false, reason: 'Engine hash mismatch.' };
        }
        if (actual.snapshotHash !== expectedCertification.snapshotHash) {
            return { valid: false, reason: 'Snapshot hash mismatch.' };
        }
        if (actual.contentHash !== expectedCertification.contentHash) {
            return { valid: false, reason: 'Content hash mismatch.' };
        }
        if (actual.lineageRootId !== expectedCertification.lineageRootId) {
            return { valid: false, reason: 'Lineage root mismatch.' };
        }
        if (actual.lineageNodeId !== expectedCertification.lineageNodeId) {
            return { valid: false, reason: 'Lineage node mismatch.' };
        }
        if (actual.fingerprint !== expectedCertification.fingerprint) {
            return { valid: false, reason: 'Replay fingerprint mismatch.' };
        }
        if (actual.capabilityHash !== expectedCertification.capabilityHash) {
            return { valid: false, reason: 'Capability hash mismatch.' };
        }
        if (actual.certificationHash !== expectedCertification.certificationHash) {
            return { valid: false, reason: 'Certification hash mismatch.' };
        }
        if (actual.certified !== true || expectedCertification.certified !== true) {
            return { valid: false, reason: 'Template certification failed.' };
        }

        return { valid: true };
    }

    return verifyLegacyTemplateCertification({
        template,
        engineVersion,
        publicKey,
    });
}
