import type { PageServerLoad } from './$types';

/** articles/development/personal-update-1-26-26.php */
export const load: PageServerLoad = async () => {
	return {
		meta: {
			title: 'Personal Update',
			description:
				"I live in Minneapolis. If you don't know what's happening right now in the United States, this is my alarm for anyone who will listen."
		}
	};
};
