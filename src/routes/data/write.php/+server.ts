import { writeFile } from 'node:fs/promises';
import type { RequestHandler } from './$types';
import { requireDevTools, staticPath } from '$lib/server/devTools';

/**
 * data/write.php — the ranker (js/battle/rankers/Ranker.js, RankerOverall.js) POSTs a finished
 * ranking set here and the PHP dropped it into `data/rankings/{cup}/{category}/rankings-{league}.json`.
 * "This really, really, really doesn't belong in production. So watch out." — hence dev-only.
 * Every response is plain text with a 200, exactly like the PHP's exit()/echo.
 */
const LEAGUES = ['500', '1500', '2500', '10000'];
const CATEGORIES = [
	'closers',
	'attackers',
	'defenders',
	'leads',
	'switches',
	'chargers',
	'consistency',
	'overall',
	'beaminess'
];

/** PHP basename(): the last non-empty path segment. */
function basename(value: string): string {
	const parts = value.split('/').filter((part) => part !== '');
	return parts.length > 0 ? parts[parts.length - 1] : '';
}

function text(body: string): Response {
	return new Response(body, { headers: { 'content-type': 'text/html; charset=UTF-8' } });
}

export const POST: RequestHandler = async ({ request }) => {
	requireDevTools();

	const form = await request.formData();
	const post = (key: string): string | undefined => {
		const value = form.get(key);
		return typeof value === 'string' ? value : undefined;
	};

	const data = post('data');
	const league = post('league');
	const category = post('category');
	const cup = post('cup');

	if (data === undefined || league === undefined || category === undefined || cup === undefined) {
		return text('Data does not have valid keys.');
	}

	if (!LEAGUES.includes(league) || !CATEGORIES.includes(category)) {
		return text('League or category is not valid');
	}

	// json_decode($_POST['data']) === null → invalid (the literal "null" counts as invalid too).
	let decoded: unknown;
	try {
		decoded = JSON.parse(data);
	} catch {
		return text('JSON cannot be decoded.');
	}
	if (decoded === null) {
		return text('JSON cannot be decoded.');
	}

	const filepath = staticPath(
		'data',
		'rankings',
		basename(cup),
		category,
		`rankings-${league}.json`
	);

	try {
		await writeFile(filepath, data);
	} catch {
		return text('{ "status": "Fail" }');
	}

	return text('{ "status": "Success" }');
};

/** A GET has no $_POST data: the PHP printed the first validation message (404 in prod). */
export const GET: RequestHandler = async () => {
	requireDevTools();
	return text('Data does not have valid keys.');
};
