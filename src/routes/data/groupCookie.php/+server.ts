import type { RequestHandler } from './$types';
import { phpJsonEncode } from '$lib/php';
import { requireDevTools } from '$lib/server/devTools';

const FIVE_YEARS = 5 * 365 * 24 * 60 * 60;

/**
 * PHP's setcookie() percent-encodes the value the way rawurlencode() does — the reference
 * site writes `Foo%20Bar`, not the `Foo+Bar` that $lib/php's phpUrlencode() (urlencode)
 * would produce — so this endpoint encodes cookie values itself.
 */
function phpCookieEncode(value: string): string {
	return encodeURIComponent(value).replace(/[!'()*]/g, (c) =>
		'%' + c.charCodeAt(0).toString(16).toUpperCase()
	);
}

/**
 * data/groupCookie.php — legacy endpoint that stored a custom Pokemon group in a
 * `custom_group_<slug>` cookie. Nothing calls it any more (groups live in localStorage and
 * footer.php migrates the old cookies), so it is a dev-only tool now, but the behaviour is
 * ported verbatim.
 */
export const POST: RequestHandler = async ({ request, cookies }) => {
	requireDevTools();

	const form = await request.formData();
	const post = (key: string): string | undefined => {
		const value = form.get(key);
		return typeof value === 'string' ? value : undefined;
	};

	const name = post('name');

	// if(! isset($_POST['name'])) — echoed without a Content-Type header, so PHP's default.
	if (name === undefined) {
		return new Response(phpJsonEncode({ response: 'error' }), {
			headers: { 'content-type': 'text/html; charset=UTF-8' }
		});
	}

	const raw = post('data');
	// PHP reads $_POST['data'] unconditionally here (null when it was not posted).
	const data = { name, data: raw === undefined ? null : raw };

	// strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '_', $_POST['name'])))
	const slug = name.replace(/[^A-Za-z0-9-]+/g, '_').trim().toLowerCase();

	const options = {
		path: '/',
		httpOnly: false,
		secure: false,
		sameSite: 'lax' as const,
		encode: phpCookieEncode
	};

	if (raw !== undefined) {
		cookies.set(`custom_group_${slug}`, phpJsonEncode(data), { ...options, maxAge: FIVE_YEARS });
	}

	// setcookie(..., '', time()-3600, '/') — an expired cookie, i.e. a delete.
	if (post('delete') !== undefined) {
		cookies.delete(`custom_group_${slug}`, options);
	}

	return new Response(phpJsonEncode({ response: 'success', data }), {
		headers: { 'content-type': 'application/json' }
	});
};
