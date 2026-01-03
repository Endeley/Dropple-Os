export function createDocument() {
    return {
        id: crypto.randomUUID(),
        branches: {
            main: {
                base: null, // parent branch
                events: [],
                head: null,
                checkpoints: [],
            },
        },
        currentBranch: 'main',
    };
}
