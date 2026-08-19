import type { PageServerLoad } from './$types';

/** articles/index.php */
export const load: PageServerLoad = async () => {
	return {
		meta: {
			title: 'Articles',
			description: 'Read up on tips, tricks, and analysis for Pokemon GO PvP.'
		}
	};
};
