import type { PageServerLoad } from './$types';

/** moves.php */
export const load: PageServerLoad = async ({ parent }) => {
	const { get } = await parent();

	let title = 'PvP Moves';

	if (get && get.mode !== undefined) {
		if (get.mode === 'fast') {
			title = 'PvP Fast Moves';
		} else if (get.mode === 'charged') {
			title = 'PvP Charged Moves';
		}
	}

	return {
		meta: {
			canonical: '/moves/',
			title,
			description: 'Explore moves and movesets in Pokemon GO PvP.'
		}
	};
};
