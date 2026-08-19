import type { PageServerLoad } from './$types';

/** articles/development/developer-notes-1-27-0.php */
export const load: PageServerLoad = async () => {
	return {
		meta: {
			title: 'PvPoke Developer Notes - Update 1.27.0',
			description:
				'Get an overview on updates to the core simulation logic and default settings, including baiting behavior and optimized move timing.'
		}
	};
};
