import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { viteSingleFile } from 'vite-plugin-singlefile';

const outputDirectory = process.env.FILE_PROTOCOL_OUTPUT || 'offline-dist';

export default defineConfig({
  base: './',
  plugins: [
    vue(),
    viteSingleFile()
  ],
  build: {
    outDir: outputDirectory,
    emptyOutDir: false,
    target: 'es2018',
    cssCodeSplit: false,
    modulePreload: false,
    rollupOptions: {
      output: { inlineDynamicImports: true }
    }
  }
});
