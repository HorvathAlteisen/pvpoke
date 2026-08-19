import type { PageServerLoad } from './$types';
import { requireDevTools } from '$lib/server/devTools';

/** data/parse.php — developer tool: 404 unless the dev tools are enabled (CONVENTIONS §5). */
export const load: PageServerLoad = async () => {
	requireDevTools();
	return {};
};
