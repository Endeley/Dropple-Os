export const COMBAT_TEMPLATES = {
    sword_slash: {
        duration: 20,
        channels: [
            {
                controllerId: 'arm_R_CTRL',
                channel: 'rotateX',
                keys: [
                    { frame: 0, value: 0 },
                    { frame: 10, value: -40 },
                    { frame: 20, value: 70 },
                ],
            },
        ],
    },
    stagger: {
        duration: 15,
        channels: [
            {
                controllerId: 'spine_CTRL',
                channel: 'rotateZ',
                keys: [
                    { frame: 0, value: 0 },
                    { frame: 5, value: 20 },
                    { frame: 15, value: 0 },
                ],
            },
        ],
    },
};

