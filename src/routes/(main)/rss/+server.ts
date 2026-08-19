import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

/**
 * .htaccess: `RewriteRule ^rss/$ rss/feed.xml [L]` — Apache served the file inline, so this
 * endpoint (route id `/rss`, the target of the `rss/$` rewrite in lib/rewrites.ts) does the
 * same rather than redirecting. The feed itself lives in static/ and is never edited.
 */
// The endpoint's route id is `/rss` but the legacy URL is `/rss/` (the rewrite target), so
// the trailing slash must not trigger SvelteKit's normalising redirect.
export const trailingSlash = 'ignore';

export const GET: RequestHandler = async () => {
	let xml: string;
	try {
		xml = await readFile(path.join(process.cwd(), 'static', 'rss', 'feed.xml'), 'utf8');
	} catch {
		error(404, 'Not Found');
	}

	return new Response(xml, {
		headers: { 'content-type': 'application/xml' }
	});
};
