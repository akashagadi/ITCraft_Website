import {defineConfig} from 'vite';

export default defineConfig(({command}) => ({
  // GitHub Pages serves this repository below /ItCraft_Website/.
  // Keep the local dev server at / so existing localhost checks stay simple.
  base: command === 'build' ? '/ItCraft_Website/' : '/',
}));
