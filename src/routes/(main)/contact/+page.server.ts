import type { PageServerLoad } from './$types';

/** contact.php */
export const load: PageServerLoad = async () => {
	return {
		meta: {
			title: 'Contact',
			description: 'Get in touch, report a technical issue, or lend your support through Patreon!'
		}
	};
};
