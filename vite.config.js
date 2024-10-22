import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()], ssr: { noExternal: [ 'postprocessing', 'three-good-godrays' ] },
	build: {
		outDir: 'build',
	  },
});
