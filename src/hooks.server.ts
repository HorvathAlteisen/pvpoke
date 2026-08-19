import type { Handle } from '@sveltejs/kit';
import { base } from '$app/paths';
import { parseSettingsCookie, settingIsOne } from '$lib/settings';
import { phpUrldecode } from '$lib/php';

const FIVE_YEARS = 5 * 365 * 24 * 60 * 60;

/** Season-preview prefixes that src/.htaccess redirected to the current site (`[R,L]` = 302). */
const SEASON_PREFIXES = [
	'season-13',
	'season-15',
	'world-of-wonders',
	'shared-skies',
	'new-season',
	'might-and-mastery',
	'delightful-days',
	'new-season-2026',
	'precious-paths',
	'memories',
	'forever-forward'
];

function redirect(status: number, location: string): Response {
	return new Response(null, { status, headers: { location } });
}

export const handle: Handle = async ({ event, resolve }) => {
	const { url, cookies } = event;
	let path = url.pathname;
	if (base && path.startsWith(base)) path = path.slice(base.length);
	path = path.replace(/^\//, '');

	// --- legacy redirects from src/.htaccess -------------------------------------------
	for (const prefix of SEASON_PREFIXES) {
		if (path.startsWith(prefix + '/')) {
			// RewriteRule ^season-13/(.*)$ /$1 [R,L] — query string is carried over
			return redirect(302, `${base}/${path.slice(prefix.length + 1)}${url.search}`);
		}
	}
	if (path.startsWith('unite')) {
		// RewriteRule ^unite(.*)$ https://unite.pvpoke.com [R=301,L]
		return redirect(301, 'https://unite.pvpoke.com' + url.search);
	}
	if (path.startsWith('contribute')) {
		// RewriteRule ^contribute(.*)$ https://pvpoke.com/contact [R=301,L]
		return redirect(301, 'https://pvpoke.com/contact' + url.search);
	}
	if (/(^|\/)index\.php$/.test(path)) {
		// RewriteCond %{THE_REQUEST} ^[A-Z]{3,9}\ /(.*)index\.php($|\ |\?)  →  /%1 [R=301,L]
		return redirect(301, `${base}/${path.slice(0, -'index.php'.length)}${url.search}`);
	}

	// --- header.php: settings + migration cookies ----------------------------------------
	// PHP url-decodes cookie values with urldecode() ("+" = space); mirror that.
	const rawSettings = cookies.get('settings', { decode: phpUrldecode });
	event.locals.settings = parseSettingsCookie(rawSettings);

	event.locals.performGroupMigration = false;
	if (cookies.get('migrate') === undefined) {
		event.locals.performGroupMigration = true;
		// setcookie('migrate', 'true', time() + 5y, '/') — plain cookie, no HttpOnly/Secure
		cookies.set('migrate', 'true', {
			path: '/',
			maxAge: FIVE_YEARS,
			httpOnly: false,
			secure: false,
			sameSite: 'lax'
		});
	}

	// header.php: <body class="colorblind"> when colorblindMode == 1. tera/header.php has a
	// plain <body> (it only reads the `ads` setting), so the tera subtree gets no attributes.
	const isTera = event.route.id?.startsWith('/(tera)/') ?? false;
	const bodyAttrs =
		!isTera && settingIsOne(event.locals.settings.colorblindMode) ? ' class="colorblind"' : '';

	return resolve(event, {
		transformPageChunk: ({ html }) => html.replace('%pvpoke.bodyattrs%', bodyAttrs)
	});
};
