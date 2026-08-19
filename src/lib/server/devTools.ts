/**
 * CONVENTIONS §5: the developer/content tools (data/write.php, data/compile.php,
 * data/movesets.php, data/parse*.php, data/groupCookie.php, data/training/getTraining.php)
 * only exist while developing. Everywhere else they must look like they were never deployed,
 * i.e. answer with the plain SvelteKit 404 — the PHP site simply did not ship them.
 */
import { error } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';

/** `pnpm dev`, or PVPOKE_DEV_TOOLS=1 on a built server. */
export function devToolsEnabled(): boolean {
	return dev || env.PVPOKE_DEV_TOOLS === '1';
}

/** Throws a 404 unless the developer tools are enabled. */
export function requireDevTools(): void {
	if (!devToolsEnabled()) {
		error(404, 'Not Found');
	}
}

/** Absolute path of the `static/` directory (the old `src/` tree of static assets). */
export function staticPath(...segments: string[]): string {
	return [process.cwd(), 'static', ...segments].join('/');
}
