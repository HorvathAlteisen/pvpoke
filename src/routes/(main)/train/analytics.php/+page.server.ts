import type { PageServerLoad } from './$types';

/** train/analytics.php — dev tool, reachable only as /train/analytics.php (no rewrite rule). */
export const load: PageServerLoad = async () => {
	return {
		meta: {
			title: 'Training Battle',
			description: 'Select your team and practice battling against an AI.'
		}
	};
};
