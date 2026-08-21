import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		// The site ships no client-side Svelte (csr = false), so HMR has nothing to update;
		// turning it off also stops vite-plugin-svelte's dev-only trick of injecting ` *{}`
		// before the last `</style>` it finds in a component source — which would corrupt the
		// legacy inline <style> blocks we emit verbatim with {@html}.
		hmr: false,
		// The repo may live on a bind mount (9p/drvfs in a WSL2 dev container) where inotify
		// never fires; set PVPOKE_WATCH_POLL=1 to fall back to polling instead of restarting
		// `pnpm dev` after every edit. Off by default because polling static/ (130+ MB) is costly.
		watch:
			process.env.PVPOKE_WATCH_POLL === '1'
				? { usePolling: true, interval: 1000, ignored: ['**/static/**'] }
				: undefined
	},
	test: {
		include: ['src/**/*.test.ts', 'tests/**/*.test.ts'],
		// NOT 'jsdom'. The legacy tests under tests/legacy build their own JSDOM per file (see
		// tests/legacy/harness.ts). On the 9p bind mount this repo lives on, `import('jsdom')`
		// costs ~35s; vitest's jsdom environment pays that per test FILE, the harness pays it
		// once per worker. Do not "fix" this by switching to environment: 'jsdom'.
		environment: 'node',
		// Threads + isolate:false so the one-off jsdom import cost is amortised across every
		// test file that lands in a worker. Consequence: module scope is SHARED between test
		// files in a worker, so the harness must keep all mutable state on the env instance.
		pool: 'threads',
		isolate: false,
		poolOptions: {
			threads: {
				// minThreads MUST equal maxThreads. With minThreads < maxThreads, tinypool scales
				// idle workers down mid-run and kills one that is still ~40s into `import('jsdom')`,
				// which surfaces as `Unhandled Rejection: Error: Terminating worker thread` and a
				// non-zero exit even though every test passed. Reproducible on this machine.
				minThreads: 4,
				maxThreads: 4
			}
		},
		coverage: {
			provider: 'v8',
			include: ['static/js/**/*.js', 'static/tera/js/**/*.js', 'scripts/*.js'],
			// Vendored third-party. Neither is ours to fix, so neither is ours to cover.
			// See tests/legacy/CONVENTIONS.md §11.
			exclude: ['static/js/libs/jquery-3.3.1.min.js', 'static/js/libs/hexagon-chart.js'],
			reporter: ['text', 'html', 'json-summary'],
			reportsDirectory: 'coverage',
			all: true
		}
	}
});
