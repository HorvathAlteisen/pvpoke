import type { PageServerLoad } from './$types';

/** gm-editor/index.php */
export const load: PageServerLoad = async () => {
	return {
		meta: {
			title: 'Gamemaster Editor',
			description: 'Customize Pokemon or Moves for your simulations.'
		}
	};
};
