import {defineConfig, loadEnv} from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import prodConfig from './vite.config.prod';
import devConfig from './vite.config.dev';

// https://vitejs.dev/config/

export default defineConfig(({command, mode}) => {
        const env = loadEnv(mode, process.cwd(), '');
        console.log(env.NODE_ENV, mode);
        if (mode === 'production') {
            console.log('return prodConfig')
            return prodConfig
        } else {
            console.log('return devConfig')
            return devConfig
        }
    }
);
