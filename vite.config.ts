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
		include: ['src/**/*.test.ts']
	}
});
