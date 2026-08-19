import type { PageServerLoad } from './$types';

/** articles/community-day/23-07-poliwag.php */
export const load: PageServerLoad = () => {
	return {
		meta: {
			title: 'Poliwag Community Day Guide for PvP',
			description:
				"Poliwag is waddling into Community Day! Both Poliwrath and Politoed are viable in PvP, so let's dive into the impact of their exclusive moves.",
			ogImage: 'https://pvpoke.com/articles/article-assets/community-day/23-07-poliwag/og.jpg'
		}
	};
};
