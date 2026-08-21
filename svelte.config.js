import adapter from '@sveltejs/adapter-node';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	compilerOptions: {
		// The ported markup must match the legacy PHP output byte for byte, so missing
		// alt/ARIA attributes are intentional; svelte-check honours this filter.
		warningFilter: (warning) => !warning.code.startsWith('a11y')
	},
	kit: {
		adapter: adapter(),
		alias: {
			// Legacy-test harness. Declared here (rather than only in vite.config.ts) so that
			// `svelte-kit sync` also writes the tsconfig path mapping for editors/svelte-check.
			'@harness': 'tests/legacy/harness.ts'
		},
		files: {
			assets: 'static',
			hooks: {
				client: 'src/hooks.client',
				server: 'src/hooks.server',
				universal: 'src/hooks'
			},
			lib: 'src/lib',
			params: 'src/params',
			routes: 'src/routes',
			serviceWorker: 'src/service-worker',
			appTemplate: 'src/app.html',
			errorTemplate: 'src/error.html'
		}
	},
	// Same filter for the Vite/rollup build output.
	onwarn(warning, handler) {
		if (warning.code.startsWith('a11y')) return;
		handler(warning);
	}
};

export default config;
