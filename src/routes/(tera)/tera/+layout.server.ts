import type { LayoutServerLoad } from './$types';
import { dev } from '$app/environment';
import { siteVersion, TERA_SITE_VERSION } from '$lib/site';

/**
 * tera/header.php sets its own `$SITE_VERSION = '1.3.11'` (random per-request in dev, same
 * cache-busting trick as the main site) instead of the root `$SITE_VERSION = '1.37.4.6'`.
 * The root `+layout.server.ts` already computed everything else; this only overrides
 * `siteVersion` for the tera subtree.
 */
export const load: LayoutServerLoad = async ({ parent }) => {
	const parentData = await parent();

	return {
		...parentData,
		siteVersion: siteVersion(dev, TERA_SITE_VERSION)
	};
};
