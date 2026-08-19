import type { PageServerLoad } from './$types';

/** articles/community-day/24-04-bellsprout.php */
export const load: PageServerLoad = () => {
	return {
		meta: {
			title: 'Bellsprout Community Day Guide for PvP',
			description:
				"One of PvP's most feared Pokemon is getting its Community Day! How do Magical Leaf and Razor Leaf compare? Check out more info on Bellsprout Community Day and what IV's to watch for.",
			ogImage: 'https://pvpoke.com/articles/article-assets/community-day/24-04-bellsprout/og.jpg'
		}
	};
};
