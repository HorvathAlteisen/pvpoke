import type { PageServerLoad } from './$types';

/** custom-rankings.php — sets no $CANONICAL. */
export const load: PageServerLoad = async () => {
	return {
		meta: {
			title: 'Custom Rankings',
			description: 'Configure a custom Pokemon GO tournament and see simple rankings.'
		}
	};
};
