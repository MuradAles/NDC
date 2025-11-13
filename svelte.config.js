import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		paths: {
			// GitHub Pages base path - repository name is NDC
			// Use /NDC for production builds, empty for local dev
			base: process.env.NODE_ENV === 'production' ? '/NDC' : ''
		},
		adapter: adapter({
			// default options are shown. On some platforms
			// these options are set automatically — see below
			pages: 'build',
			assets: 'build',
			fallback: 'index.html', // Enable SPA mode for GitHub Pages
			precompress: false,
			strict: true
		}),
		prerender: {
			handleHttpError: 'warn'
		}
	}
};

export default config;
