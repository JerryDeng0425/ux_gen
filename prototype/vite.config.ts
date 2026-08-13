import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
  base: './',
  plugins: [vue(), viteSingleFile()],
  build: {
    outDir: process.env.PROTOTYPE_OUTPUT || 'dist',
    emptyOutDir: false,
    target: 'es2018',
    cssCodeSplit: false,
    modulePreload: false,
    rollupOptions: { output: { inlineDynamicImports: true } }
  }
});
