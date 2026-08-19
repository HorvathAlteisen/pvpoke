import type { PageServerLoad } from './$types';

/** train/index.php */
export const load: PageServerLoad = async () => {
	return {
		meta: {
			title: 'Training Battle',
			description: 'Select your team and practice battling against an AI.'
		}
	};
};
