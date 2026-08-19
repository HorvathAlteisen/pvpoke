import type { PageServerLoad } from './$types';

/**
 * articles/legacy/mirror-cup-past-metas.php — this legacy article `require_once`s a non-existent
 * `../header.php` in PHP (the reference site 500s on it); ported with the normal layout.
 */
export const load: PageServerLoad = async () => {
	return {
		meta: {
			title: 'Mirror Cup: Catch Up with Past Metas',
			description:
				"You get to decide which previous Cup to play in for the Mirror Cup! What's new with some of our old stomping grounds?"
		}
	};
};
