'use client';

import { buildMotionIR } from '@/timeline/export/motionIR.js';

export function KeyframeDots({ timeline }) {
    const motion = buildMotionIR(timeline);
    if (!motion || !motion.animations || !motion.duration) return null;

    return (
        <div style={{ position: 'relative', height: 16 }}>
            {motion.animations.flatMap((anim) =>
                anim.keyframes.map((kf, i) => (
                    <div
                        key={`${anim.target}-${anim.property}-${i}`}
                        style={{
                            position: 'absolute',
                            left: `${(kf.time / motion.duration) * 100}%`,
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            background: '#2563eb',
                            top: 5,
                        }}
                    />
                ))
            )}
        </div>
    );
}
