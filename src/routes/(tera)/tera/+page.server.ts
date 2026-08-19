import type { PageServerLoad } from './$types';
import { base } from '$app/paths';
import { matchRewrite } from '$lib/rewrites';
import { htmlspecialchars, ucwords } from '$lib/php';

/**
 * tera/index.php: if `p` and `t` are both set, the Pokemon name is put in the meta title,
 * exactly like battle.php/rankings.php (`ucwords(str_replace('_',' ',
 * explode('-', htmlspecialchars($_GET['p']))[0]))`). $CANONICAL is built from the RAW
 * (unescaped) $_GET values though — `'/tera/' . $_GET['p'] . '/' . $_GET['t'] . '/'` — and is
 * only htmlspecialchars()'d later, at output, by tera/header.php. The `get` from the parent
 * layout is already htmlspecialchars()'d (mirroring PHP's $_GET after header.php mutates it
 * in place), so it cannot be reused for the canonical here; the raw params are recomputed the
 * same way the root layout computes `get`, minus the escaping step.
 */
export const load: PageServerLoad = async ({ url }) => {
	let path = url.pathname;
	if (base && path.startsWith(base)) path = path.slice(base.length);
	path = path.replace(/^\//, '');

	const rawParams: Record<string, string> = { ...(matchRewrite(path)?.params ?? {}) };
	for (const [key, value] of url.searchParams) {
		rawParams[key] = value;
	}

	const rawP = rawParams.p;
	const rawT = rawParams.t;

	if (rawP === undefined || rawT === undefined) {
		return {};
	}

	const name = ucwords(htmlspecialchars(rawP).split('-')[0].replace(/_/g, ' '));

	return {
		meta: {
			title: `${name} Tera Raid Counters`,
			description: `Check ${name} Tera Raid counters and attackers with the best calculated type matchups.`,
			canonical: `/tera/${rawP}/${rawT}/`
		}
	};
};
