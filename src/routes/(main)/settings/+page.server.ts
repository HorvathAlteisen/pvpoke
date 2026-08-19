import type { PageServerLoad } from './$types';

/** settings.php */
export const load: PageServerLoad = async () => {
	return {
		meta: {
			canonical: '/settings/',
			title: 'Site Settings',
			description: 'Adjust your settings and preferences for the site.'
		}
	};
};
