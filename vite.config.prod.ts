import commonConfig from './vite.config.common';

export default {
    ...commonConfig,
    build: {
        outDir:'./website',
        emptyOutDir: true,
    },
    base: '/',
};
