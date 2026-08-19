import type { PageServerLoad } from './$types';

/** rankersandbox.php (developer tool) — no $META_* variables, so the default head is used. */
export const load: PageServerLoad = async () => {
	return {};
};
