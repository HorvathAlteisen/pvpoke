import type { PageServerLoad } from './$types';

/**
 * ranker.php (developer tool) — the PHP sets no $META_* variables at all, so the layout
 * renders header.php's default title/description.
 */
export const load: PageServerLoad = async () => {
	return {};
};
