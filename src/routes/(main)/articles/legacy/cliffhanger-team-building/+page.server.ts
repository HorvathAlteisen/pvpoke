import type { PageServerLoad } from './$types';

/** articles/legacy/cliffhanger-team-building.php (uses `../../header.php`, which exists). */
export const load: PageServerLoad = async () => {
	return {
		meta: {
			title: 'Team Building for GO Stadium Cliffhanger',
			description:
				'GO Stadium has introduced an exciting new format called Cliffhanger! Learn how to spend your points and build your team.'
		}
	};
};
