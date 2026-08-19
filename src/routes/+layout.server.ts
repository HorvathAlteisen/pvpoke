import type { LayoutServerLoad } from './$types';
import { dev } from '$app/environment';
import { base } from '$app/paths';
import { env } from '$env/dynamic/private';
import { matchRewrite } from '$lib/rewrites';
import { htmlspecialchars, phpUrldecode } from '$lib/php';
import { siteVersion } from '$lib/site';
import type { PvpokeLayoutData } from '$lib/site';

/**
 * Everything header.php / footer.php computed from the environment, the cookies and the
 * request. Components read it via `page.data` (see `$lib/site` PvpokeLayoutData).
 */
export const load: LayoutServerLoad = async ({ url, cookies, locals }): Promise<PvpokeLayoutData> => {
	const webRoot = `${base}/`;

	// --- $_GET: mod_rewrite params ([QSA] → overlaid by the real query string) ----------
	let path = url.pathname;
	if (base && path.startsWith(base)) path = path.slice(base.length);
	path = path.replace(/^\//, '');

	const params: Record<string, string> = { ...(matchRewrite(path)?.params ?? {}) };
	for (const [key, value] of url.searchParams) {
		params[key] = value;
	}
	// header.php: foreach($_GET as &$param){ $param = htmlspecialchars($param); }
	for (const key of Object.keys(params)) {
		params[key] = htmlspecialchars(params[key]);
	}
	const get = Object.keys(params).length > 0 ? params : false;

	// --- footer.php: legacy custom_group_* cookies to migrate into localStorage ---------
	const cookieGroupsToMigrate: string[] = [];
	if (locals.performGroupMigration) {
		for (const { name, value } of cookies.getAll({ decode: phpUrldecode })) {
			if (name.includes('custom_group')) {
				cookieGroupsToMigrate.push(value);
			}
		}
	}

	return {
		dev,
		webRoot,
		host: `${url.origin}${webRoot}`,
		siteVersion: siteVersion(dev),
		requestUri: url.pathname + url.search,
		get,
		settings: locals.settings,
		gaId: env.PVPOKE_GA_ID ?? '',
		performGroupMigration: locals.performGroupMigration,
		cookieGroupsToMigrate
	};
};
