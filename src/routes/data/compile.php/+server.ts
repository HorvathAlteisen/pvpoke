import type { RequestHandler } from './$types';
import { compileGamemaster } from '$lib/server/compileGamemaster';
import { requireDevTools } from '$lib/server/devTools';

/**
 * data/compile.php — the developer panel links here (target _blank). It rebuilds
 * gamemaster.json / gamemaster.min.json and prints "gamemaster compiled" inside the same
 * bare HTML page the PHP emitted.
 */
export const GET: RequestHandler = async () => {
	requireDevTools();

	const { messages } = compileGamemaster();

	const body =
		'<!doctype html>\n<html>\n<head>\n<meta charset="utf-8">\n<title>Untitled Document</title>\n</head>\n\n<body>\n' +
		messages.join('') +
		'gamemaster compiled</body>\n</html>\n';

	return new Response(body, { headers: { 'content-type': 'text/html; charset=UTF-8' } });
};
