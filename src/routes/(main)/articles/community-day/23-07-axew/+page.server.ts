import type { PageServerLoad } from './$types';

/** articles/community-day/23-07-axew.php */
export const load: PageServerLoad = () => {
	return {
		meta: {
			title: 'Axew Community Day Guide for PvP',
			description:
				"Axew is hacking its way onto the Community Day roster. Can it cut a place in PvP? Read up on the meta impact for Haxorus and Breaking Swipe!",
			ogImage: 'https://pvpoke.com/articles/article-assets/community-day/23-07-axew/og.jpg'
		}
	};
};
