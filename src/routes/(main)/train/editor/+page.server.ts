import type { PageServerLoad } from './$types';

/** train/editor.php */
export const load: PageServerLoad = async () => {
	return {
		meta: {
			title: 'Training Team Editor',
			description: 'Edit the teams you battle in training.'
		}
	};
};
