import type { PageServerLoad } from './$types';

/** articles/community-day/23-04-togetic.php */
export const load: PageServerLoad = () => {
	return {
		meta: {
			title: 'Togetic Community Day Guide for PvP',
			description:
				'Togetic is a charming addition to the Community Day roster, and its evolution, Togekiss, has play in all three leagues. Find out what to look out for in PvP.',
			ogImage: 'https://pvpoke.com/articles/article-assets/community-day/23-04-togetic/og.jpg'
		}
	};
};
