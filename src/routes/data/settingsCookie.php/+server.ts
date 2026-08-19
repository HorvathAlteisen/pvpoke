import type { RequestHandler } from './$types';
import { phpJsonEncode, phpUrlencode } from '$lib/php';

const FIVE_YEARS = 5 * 365 * 24 * 60 * 60;

/**
 * data/settingsCookie.php — called by js/interface/Settings.js, Pokebox.js and the
 * gm-editor with a form-urlencoded POST of the settings fields. PHP did
 * `setcookie('settings', json_encode($_POST), +5y, '/')` and answered
 * `{"response":"success","data":"<json>"}`. $_POST values are always strings.
 */
export const POST: RequestHandler = async ({ request, cookies }) => {
	const form = await request.formData();
	const post: Record<string, string> = {};
	for (const [key, value] of form) {
		if (typeof value === 'string') {
			post[key] = value;
		}
	}

	const data = phpJsonEncode(post);

	// Plain cookie like PHP's setcookie(): readable by JS, not Secure, url-encoded value.
	cookies.set('settings', data, {
		path: '/',
		maxAge: FIVE_YEARS,
		httpOnly: false,
		secure: false,
		sameSite: 'lax',
		encode: phpUrlencode
	});

	return new Response(phpJsonEncode({ response: 'success', data }), {
		headers: { 'content-type': 'application/json' }
	});
};
