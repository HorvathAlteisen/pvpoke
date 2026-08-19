import type { PageServerLoad } from './$types';

/** articles/community-day/24-11-mankey.php */
export const load: PageServerLoad = () => {
	return {
		meta: {
			title: 'Mankey Community Day Guide for PvP',
			description:
				"Mankey Community Day is a massive event for PvP! Rage Fist is a big upgrade for both Annihilape and Primeape. Here's all you need to know and what to look for this weekend!",
			ogImage: 'https://pvpoke.com/articles/article-assets/community-day/24-11-mankey/og.jpg'
		}
	};
};
