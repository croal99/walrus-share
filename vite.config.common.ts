import react from "@vitejs/plugin-react-swc";
import path, {resolve} from "path";

export default {
    plugins: [react()],
    server: {
        host: '0.0.0.0',
        port: 8000,
        hmr: {
            // overlay: false,
        }
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@images': path.resolve(__dirname, './images')
        }
    },
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                nested: resolve(__dirname, 'admin/index.html'),
            },
        },
    },
}
