import type { PageServerLoad } from './$types';

/** articles/community-day/25-08-rookidee.php */
export const load: PageServerLoad = () => {
	return {
		meta: {
			title: 'Rookidee Community Day Guide for PvP',
			description:
				"Corviknight makes a bid to enter the top meta. Will it finally beat the fraud allegations? Read up on everything you need to know for Rookidee Community Day!",
			ogImage: 'https://pvpoke.com/articles/article-assets/community-day/25-08-rookidee/og.jpg'
		}
	};
};
