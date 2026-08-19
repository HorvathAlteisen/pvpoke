import type { RequestHandler } from './$types';
import { phpJsonEncode } from '$lib/php';
import { getPool } from '$lib/server/db';

/**
 * data/training/postTraining.php — js/training/BattleInterface.js reports the result of a
 * finished training battle here with a jQuery `$.ajax({ data: { pokemon: [...], teams: [...] } })`,
 * i.e. form-urlencoded keys of the shape `pokemon[0][pokemonId]`.
 *
 * The PHP rate-limited with `$_SESSION['last_training_timestamp']`; there are no sessions here,
 * so the same timestamp lives in an httpOnly cookie (CONVENTIONS §5). The answer is always
 * `{"result":…,"error":"…"}` with a 200 — a database problem must never surface as a stack trace.
 */

const RATE_LIMIT_SECONDS = 120;
const RATE_LIMIT_COOKIE = 'pvpoke_training_ts';

interface Response_ {
	result: number;
	error: string;
}

function json(response: Response_): Response {
	return new Response(phpJsonEncode(response), {
		headers: { 'content-type': 'application/json; charset=utf-8' }
	});
}

/**
 * PHP's $_POST parser for `name[0][key]=value` style keys, reduced to what jQuery's
 * $.param() emits for `{ pokemon: [{…}], teams: [{…}] }`. Numeric list indexes stay as
 * object keys — only the values are ever iterated.
 */
type PostValue = string | { [key: string]: PostValue };

function parsePhpPost(form: FormData): Record<string, PostValue> {
	const post: Record<string, PostValue> = {};

	for (const [rawKey, rawValue] of form) {
		if (typeof rawValue !== 'string') continue;

		const match = /^([^[]+)((?:\[[^\]]*\])*)$/.exec(rawKey);
		if (!match) continue;

		const keys = [match[1], ...[...match[2].matchAll(/\[([^\]]*)\]/g)].map((m) => m[1])];

		let node: Record<string, PostValue> = post;
		for (let i = 0; i < keys.length - 1; i++) {
			const key = keys[i];
			const next = node[key];
			if (typeof next !== 'object' || next === null) {
				node[key] = {};
			}
			node = node[key] as Record<string, PostValue>;
		}
		node[keys[keys.length - 1]] = rawValue;
	}

	return post;
}

/** The rows of a `pokemon[…]` / `teams[…]` group, skipping anything that is not a record. */
function rows(value: PostValue | undefined): Record<string, PostValue>[] {
	if (typeof value !== 'object' || value === null) return [];
	return Object.values(value).filter(
		(row): row is Record<string, PostValue> => typeof row === 'object' && row !== null
	);
}

const str = (row: Record<string, PostValue>, key: string): string => {
	const value = row[key];
	return typeof value === 'string' ? value : '';
};
/** PHP bind_param("i") — an integer cast. */
const int = (row: Record<string, PostValue>, key: string): number => {
	const value = Number(str(row, key));
	return Number.isFinite(value) ? Math.trunc(value) : 0;
};
/** PHP bind_param("d") */
const dbl = (row: Record<string, PostValue>, key: string): number => {
	const value = Number(str(row, key));
	return Number.isFinite(value) ? value : 0;
};

export const POST: RequestHandler = async ({ request, cookies }) => {
	const response: Response_ = { result: 1, error: '' };

	const now = Math.floor(Date.now() / 1000);
	const last = Number(cookies.get(RATE_LIMIT_COOKIE) ?? 0) || 0;

	if (now - last < RATE_LIMIT_SECONDS) {
		return json({ result: 0, error: 'Rate limited' });
	}

	// Like the PHP, the timestamp is recorded before the payload is even looked at.
	cookies.set(RATE_LIMIT_COOKIE, String(now), {
		path: '/',
		httpOnly: true,
		secure: false,
		sameSite: 'lax'
	});

	let post: Record<string, PostValue> = {};
	try {
		post = parsePhpPost(await request.formData());
	} catch {
		return json({ result: 0, error: 'Insufficient data posted' });
	}

	if (post.pokemon === undefined || post.teams === undefined) {
		return json({ result: 0, error: 'Insufficient data posted' });
	}

	try {
		const pool = getPool();

		const pokemonSql =
			'INSERT INTO training_pokemon(pokemonId, format, teamPosition, playerType, teamScore, individualScore, shields) VALUES (?, ?, ?, ?, ?, ?, ?)';

		for (const poke of rows(post.pokemon)) {
			try {
				await pool.execute(pokemonSql, [
					str(poke, 'pokemonId'),
					str(poke, 'format'),
					int(poke, 'teamPosition'),
					int(poke, 'playerType'),
					int(poke, 'teamScore'),
					dbl(poke, 'individualScore'),
					int(poke, 'shields')
				]);
			} catch {
				response.result = 0;
				response.error = 'One or more Pokemon records failed';
			}
		}

		const teamSql =
			'INSERT INTO training_team(teamStr, format, playerType, teamScore) VALUES (?, ?, ?, ?)';

		for (const team of rows(post.teams)) {
			try {
				await pool.execute(teamSql, [
					str(team, 'teamStr'),
					str(team, 'format'),
					int(team, 'playerType'),
					int(team, 'teamScore')
				]);
			} catch {
				response.result = 0;
				response.error = 'One or more team records failed';
			}
		}
	} catch {
		// No database configured / unreachable. The PHP would have died with a mysqli
		// exception; answer with the documented JSON shape instead.
		return json({ result: 0, error: 'Database unavailable' });
	}

	return json(response);
};
