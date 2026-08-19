import type { Reroute } from '@sveltejs/kit';
import { base } from '$app/paths';
import { matchRewrite } from '$lib/rewrites';

/**
 * Maps the legacy clean URLs (produced by src/.htaccess) onto the SvelteKit route ids.
 * `/rankings/all/1500/overall/azumarill/` is rendered by `routes/(main)/rankings`; the
 * captured parameters are recomputed by the root layout load (`get`), exactly like PHP's
 * `$_GET` after mod_rewrite.
 */
export const reroute: Reroute = ({ url }) => {
	let path = url.pathname;
	if (base && path.startsWith(base)) path = path.slice(base.length);
	path = path.replace(/^\//, '');

	const match = matchRewrite(path);
	if (match) {
		return base + match.route;
	}
};
